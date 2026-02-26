/**
 * Simple fraud / risk heuristics for plantations.
 * Flags:
 *  - duplicate GPS coordinates
 *  - high tree density (treeCount / areaHectares)
 *  - fast Panchayat approval
 */

export function analyzePlantationsRisk(plantations) {
  if (!Array.isArray(plantations)) return [];

  const byGps = new Map();
  plantations.forEach((p) => {
    const lat = p.gpsCoordinates?.lat;
    const lng = p.gpsCoordinates?.lng;
    if (lat != null && lng != null) {
      const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
      if (!byGps.has(key)) byGps.set(key, []);
      byGps.get(key).push(p._id?.toString());
    }
  });

  return plantations.map((p) => {
    const flags = [];
    const density = p.areaHectares && p.areaHectares > 0 ? p.treeCount / p.areaHectares : null;

    const lat = p.gpsCoordinates?.lat;
    const lng = p.gpsCoordinates?.lng;
    const key = lat != null && lng != null ? `${lat.toFixed(5)},${lng.toFixed(5)}` : null;
    if (key && byGps.get(key)?.length > 1) {
      flags.push('DUPLICATE_GPS');
    }

    if (density != null && density > 1000) {
      flags.push('HIGH_TREE_DENSITY');
    }

    let fastApproval = false;
    const submittedTs = p.submissionTimestamp ? new Date(p.submissionTimestamp).getTime() : null;
    const panchayatTs = p.panchayatVerification?.timestamp ? new Date(p.panchayatVerification.timestamp).getTime() : null;
    if (submittedTs && panchayatTs) {
      const diffMinutes = (panchayatTs - submittedTs) / (1000 * 60);
      if (diffMinutes > 0 && diffMinutes < 10) {
        fastApproval = true;
        flags.push('VERY_FAST_PANCHAYAT_APPROVAL');
      }
    }

    let score = 'LOW';
    if (flags.length >= 2 || (flags.length === 1 && flags[0] !== 'DUPLICATE_GPS')) {
      score = 'MEDIUM';
    }
    if (flags.includes('HIGH_TREE_DENSITY') && (flags.includes('DUPLICATE_GPS') || fastApproval)) {
      score = 'HIGH';
    }

    return {
      plantationId: p._id?.toString(),
      riskScore: score,
      flags,
    };
  });
}

