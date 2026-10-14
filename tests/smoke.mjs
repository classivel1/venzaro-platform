import test from "node:test";
import assert from "node:assert/strict";
const base=(process.env.VENZARO_BASE_URL||"http://localhost:3000").replace(/\/$/,"");
test("VENZARO health responds with expected identity",async()=>{const r=await fetch(base+"/api/health");assert.equal(r.status,200);const body=await r.json();assert.equal(body.service,"venzaro-platform")});
test("Master endpoints reject unauthenticated listing",async()=>{const r=await fetch(base+"/api/master/users");assert.equal(r.status,401)});
test("Dealer endpoints reject unauthenticated listing",async()=>{const r=await fetch(base+"/api/dealer/vehicles");assert.equal(r.status,401)});
test("Public homepage responds",async()=>{const r=await fetch(base+"/");assert.equal(r.status,200)});
test("Database readiness responds or signals outage",async()=>{const r=await fetch(base+"/api/ready");assert.ok([200,503].includes(r.status));const data=await r.json();assert.ok(["ready","unavailable"].includes(data.status));if(process.env.REQUIRE_DATABASE_READY==="true")assert.equal(r.status,200)});
