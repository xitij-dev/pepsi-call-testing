const express = require('express');
const checkAccess = require('../../middleware/checkAccess');
const hostSettlementController = require('../../controller/admin/hostSettlementHistory');

const route = express.Router();

// update paid host settlement
route.put(
  '/updatePaidSettlement/:id',
  checkAccess(),
  hostSettlementController.updatePaidSettlement
);

// get agency wise host settlement history
route.get(
  '/agencyWiseHostSettlement',
  checkAccess(),
  hostSettlementController.agencyWiseHostSettlement
);

// action for host settlement
route.patch(
  '/actionForHostSettlement/:id',
  checkAccess(),
  hostSettlementController.actionForHostSettlement
);

// pending or solved settlement
route.get(
  '/pendingOrSolvedSettlement',
  checkAccess(),
  hostSettlementController.pendingOrSolvedSettlement
);
module.exports = route;
