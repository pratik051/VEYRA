import "../config/env.js";

import { performance } from "node:perf_hooks";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { verifyFirebaseIdToken } from "../config/firebase.js";
import { createSessionForUser, getSessionUserByToken } from "../services/auth-service.js";
import connectDB from "../config/db.js";
import UserModel from "../models/user-model.js";

async function runBenchmark() {
  console.log("==================================================");
  console.log(" SAJILOMARTS AUTHENTICATION PERFORMANCE BENCHMARK");
  console.log("==================================================");

  // 1. Password Hashing & Verification
  const t0 = performance.now();
  const testPassword = "Password123!";
  const hash = await hashPassword(testPassword);
  const t1 = performance.now();
  const isValid = await verifyPassword(testPassword, hash);
  const t2 = performance.now();

  console.log(`\n[1] Password Verification:`);
  console.log(`    - Hash Generation: ${(t1 - t0).toFixed(2)} ms`);
  console.log(`    - Password Verification: ${(t2 - t1).toFixed(2)} ms (Valid: ${isValid})`);

  // 2. Database Connection & User Lookup
  console.log(`\n[2] Database & Session Flow:`);
  const dbStart = performance.now();
  const conn = await connectDB();
  const dbEnd = performance.now();
  console.log(`    - DB Connection Check: ${(dbEnd - dbStart).toFixed(2)} ms`);

  if (conn) {
    const userFetchStart = performance.now();
    const user = await UserModel.findOne().lean();
    const userFetchEnd = performance.now();
    console.log(`    - User Lookup Time: ${(userFetchEnd - userFetchStart).toFixed(2)} ms`);

    if (user) {
      // 3. Session Creation & In-Memory Priming
      const sessStart = performance.now();
      const token = await createSessionForUser(String(user._id), user);
      const sessEnd = performance.now();
      console.log(`    - Session Creation + Cache Priming: ${(sessEnd - sessStart).toFixed(2)} ms`);

      // 4. Session Validation (Cached)
      const valStart1 = performance.now();
      const sessionUser1 = await getSessionUserByToken(token);
      const valEnd1 = performance.now();
      console.log(`    - Session Validation (1st request - Cache Hit): ${(valEnd1 - valStart1).toFixed(2)} ms`);

      const valStart2 = performance.now();
      const sessionUser2 = await getSessionUserByToken(token);
      const valEnd2 = performance.now();
      console.log(`    - Session Validation (2nd request - Cache Hit): ${(valEnd2 - valStart2).toFixed(2)} ms`);
    }
  }

  // 5. Firebase Token Verification
  console.log(`\n[3] Firebase Token Verifier Check:`);
  const fbStart = performance.now();
  const decoded = await verifyFirebaseIdToken("invalid.token.structure");
  const fbEnd = performance.now();
  console.log(`    - Token Verifier Execution Time: ${(fbEnd - fbStart).toFixed(2)} ms (Result: ${decoded})`);

  console.log("\n==================================================");
  console.log(" BENCHMARK COMPLETE");
  console.log("==================================================");
  process.exit(0);
}

runBenchmark().catch((err) => {
  console.error("Benchmark error:", err);
  process.exit(1);
});
