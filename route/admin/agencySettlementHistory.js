const express = require('express');
const checkAccess = require('../../middleware/checkAccess');
const agencySettlementController = require('../../controller/admin/agencySettlementHistory');
const agencywiseSettlement = require('../../services/agencyWiseSettlement');

const route = express.Router();

route.post('/', checkAccess(), agencywiseSettlement.agencyWiseHostSettlement);

// get agencywise settlement history
route.get(
  '/pendingOrSolved',
  checkAccess(),
  agencySettlementController.getPendingOrSolvedHistory
);

// update paid agency settlement history
route.put(
  '/updatePaidHistroy/:id',
  checkAccess(),
  agencySettlementController.updatePaidHistroy
);

// get all settlement for admin penal
route.get(
  '/getAllSettlement',
  checkAccess(),
  agencySettlementController.getAllSettlementHistory
);

// get all agency info for admin penal
route.get(
  '/getAllAgencyInfo',
  checkAccess(),
  agencySettlementController.getAllAgencyInfo
);

// get all agencywise settlement for agency penal
route.get(
  '/agencySettlementForAgency',
  checkAccess(),
  agencySettlementController.agencySettlementForAgency
);

// action for agency settlement history
route.patch(
  '/actionInSettlement/:id',
  checkAccess(),
  agencySettlementController.actionForAgencySettlement
);

// get all settlement for payouts module in agency penal
route.get(
  '/getAllAgencySettlemtforPayOuts',
  checkAccess(),
  agencySettlementController.getAllAgencySettlemtforPayOuts
);
module.exports = route;
