const prisma = require("../config/database");

const PREFIXES = {
  RECEIPT: "WH/IN",
  DELIVERY: "WH/OUT",
  TRANSFER: "WH/INT",
  ADJUSTMENT: "WH/ADJ",
};

/**
 * Generate the next sequential reference number for a given operation type.
 * Must be called inside a Prisma transaction (pass `tx`) to be race-condition safe.
 *
 * @param {"RECEIPT"|"DELIVERY"|"TRANSFER"|"ADJUSTMENT"} type
 * @param {object} tx - Prisma transaction client
 */
const generateReference = async (type, tx) => {
  const prefix = PREFIXES[type] || "WH/OP";
  const client = tx || prisma;

  const last = await client.inventoryOperation.findFirst({
    where: { referenceNumber: { startsWith: `${prefix}/` } },
    orderBy: { referenceNumber: "desc" },
    select: { referenceNumber: true },
  });

  let next = 1;
  if (last) {
    const num = parseInt(last.referenceNumber.replace(`${prefix}/`, ""), 10);
    if (!isNaN(num)) next = num + 1;
  }

  return `${prefix}/${String(next).padStart(4, "0")}`;
};

/**
 * Preview the next reference number without a transaction (for UI display only).
 */
const previewReference = (type) => generateReference(type, null);

module.exports = { generateReference, previewReference };
