import { getBirthChart } from "../lib/astro";

// Reference values cross-checked against a published panchang (drikpanchang.com)
// for New Delhi on 2026-09-04: Rohini nakshatra runs until 11:04 PM IST, when
// Mrigashira begins.
describe("getBirthChart", () => {
  it("places a New Delhi noon birth in Rohini, pada 3", () => {
    const chart = getBirthChart({ date: "2026-09-04", time: "12:00", timeZone: "Asia/Kolkata" });
    expect(chart.nakshatraName).toBe("Rohini");
    expect(chart.padaIndex).toBe(2);
    expect(chart.syllable).toBe("Vi");
  });

  it("crosses into Mrigashira right at the published 11:04 PM IST boundary", () => {
    const justBefore = getBirthChart({ date: "2026-09-04", time: "23:03", timeZone: "Asia/Kolkata" });
    const justAfter = getBirthChart({ date: "2026-09-04", time: "23:05", timeZone: "Asia/Kolkata" });
    expect(justBefore.nakshatraName).toBe("Rohini");
    expect(justAfter.nakshatraName).toBe("Mrigashira");
  });

  it("gives the same absolute instant the same chart regardless of the input timezone", () => {
    // 2026-09-04 12:00 IST (UTC+5:30) == 2026-09-04 06:30 UTC == 2026-09-04 02:30 America/New_York (EDT, UTC-4)
    const fromIST = getBirthChart({ date: "2026-09-04", time: "12:00", timeZone: "Asia/Kolkata" });
    const fromNY = getBirthChart({ date: "2026-09-04", time: "02:30", timeZone: "America/New_York" });
    expect(fromNY.nakshatraName).toBe(fromIST.nakshatraName);
    expect(fromNY.padaIndex).toBe(fromIST.padaIndex);
  });
});
