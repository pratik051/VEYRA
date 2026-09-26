import "../config/env.js";
import dns from "node:dns/promises";
import net from "node:net";
import tls from "node:tls";
import nodemailer from "nodemailer";
import { getSmtpConfig, maskEmail } from "../services/emailService.js";

async function runDiagnostic() {
  console.log("=== SMTP & NETWORK DIAGNOSTIC ===");
  const config = getSmtpConfig();

  console.log(`[Config Check]`);
  console.log(`- Host: ${config.host}`);
  console.log(`- Port: ${config.port}`);
  console.log(`- Secure (SSL): ${config.secure}`);
  console.log(`- User: ${maskEmail(config.user)} (Configured: ${Boolean(config.user)})`);
  console.log(`- Pass Configured: ${Boolean(config.pass)} (Length: ${config.pass ? config.pass.length : 0})`);
  console.log(`- Resend API Configured: ${Boolean(process.env.RESEND_API_KEY)}`);
  console.log(`- Brevo API Configured: ${Boolean(process.env.BREVO_API_KEY)}`);

  // 1. DNS Resolution (IPv4 & IPv6)
  console.log(`\n[1. DNS Resolution for ${config.host}]`);
  try {
    const ipv4Addresses = await dns.resolve4(config.host);
    console.log(`✓ IPv4 Resolved addresses:`, ipv4Addresses);
  } catch (dnsErr) {
    console.warn(`✗ IPv4 DNS Error:`, dnsErr.message);
  }

  try {
    const ipv6Addresses = await dns.resolve6(config.host);
    console.log(`- IPv6 Resolved addresses:`, ipv6Addresses);
  } catch {
    console.log(`- IPv6 DNS not available or skipped.`);
  }

  // 2. Direct TCP Socket Handshake Test (Port 465 and Port 587)
  const portsToTest = [465, 587];
  for (const port of portsToTest) {
    console.log(`\n[2. Testing TCP Socket -> ${config.host}:${port}]`);
    await new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(6000);

      const start = Date.now();
      socket.connect(port, config.host, () => {
        const ms = Date.now() - start;
        console.log(`✓ TCP connected to ${config.host}:${port} in ${ms}ms`);
        socket.destroy();
        resolve();
      });

      socket.on("timeout", () => {
        console.warn(`✗ TCP connection timeout to ${config.host}:${port} (>6000ms)`);
        socket.destroy();
        resolve();
      });

      socket.on("error", (err) => {
        console.warn(`✗ TCP connection error to ${config.host}:${port}:`, err.message);
        socket.destroy();
        resolve();
      });
    });
  }

  // 3. Direct TLS Handshake for Port 465
  console.log(`\n[3. Testing TLS Handshake -> ${config.host}:465]`);
  await new Promise((resolve) => {
    const start = Date.now();
    const tlsSocket = tls.connect(
      {
        host: config.host,
        port: 465,
        rejectUnauthorized: false,
        timeout: 6000,
        family: 4
      },
      () => {
        const ms = Date.now() - start;
        console.log(`✓ TLS Handshake successful to ${config.host}:465 in ${ms}ms (Cipher: ${tlsSocket.getCipher()?.name}, Protocol: ${tlsSocket.getProtocol()})`);
        tlsSocket.destroy();
        resolve();
      }
    );

    tlsSocket.on("timeout", () => {
      console.warn(`✗ TLS Handshake timed out (>6000ms)`);
      tlsSocket.destroy();
      resolve();
    });

    tlsSocket.on("error", (err) => {
      console.warn(`✗ TLS Handshake error:`, err.message);
      tlsSocket.destroy();
      resolve();
    });
  });

  // 4. Nodemailer Transporter Verify for Port 465 and Port 587
  for (const port of [465, 587]) {
    console.log(`\n[4. Testing Nodemailer Transporter.verify() with Port ${port}]`);
    const isSecure = port === 465;
    const testTransporter = nodemailer.createTransport({
      host: config.host,
      port,
      secure: isSecure,
      auth: {
        user: config.user,
        pass: config.pass
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: "TLSv1.2"
      },
      family: 4,
      connectionTimeout: 7000,
      greetingTimeout: 7000,
      socketTimeout: 9000
    });

    try {
      const verifyStart = Date.now();
      await testTransporter.verify();
      const ms = Date.now() - verifyStart;
      console.log(`✓ Transporter.verify() SUCCESS for Port ${port} (${isSecure ? 'SSL' : 'STARTTLS'}) in ${ms}ms`);
    } catch (verErr) {
      console.warn(`✗ Transporter.verify() FAILED for Port ${port}:`, verErr.message);
    }
  }

  console.log("\n=== DIAGNOSTIC COMPLETE ===");
}

runDiagnostic().catch((e) => console.error("Diagnostic error:", e));
