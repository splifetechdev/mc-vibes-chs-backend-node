exports.getPerformanceValue = (totalQt, totalStandardQty) => {
  console.log({ totalQt, totalStandardQty });
  return Math.round((totalQt / totalStandardQty) * 100 * 100) / 100;
};

exports.getAvailabilityValue = (totalWorkHours, totalPlanHours) => {
  return Math.round((totalWorkHours / totalPlanHours) * 100 * 100) / 100 || 0;
};

exports.getQualityValue = (receivedQty, totalQty) => {
  return Math.round((receivedQty / totalQty) * 100 * 100) / 100 || 0;
};

exports.getOEEValue = (performance, availability, quality) => {
  return (
    (
      (Number(availability) * Number(quality) * Number(performance)) /
      (100 * 100)
    ).toFixed(2) || 0
  );
};
