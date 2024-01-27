/* eslint-disable no-undef */
const MESSAGE = 1;
const PURCHASE_COIN = 2;
const CALL = 3;
const LOGIN_BONUS = 4;
const ADMIN = 5;
const REFERRALBONUS = 6;
const FLASH_COIN = 7;
const GIFTOFLIVE = 8;
const GIFTOFVIDEOCALL = 9;
const VIPPLAN = 10;
const FLASHVIPCOIN = 11;

exports.HISTORY_TYPE = [
  MESSAGE,
  PURCHASE_COIN,
  CALL,
  LOGIN_BONUS,
  ADMIN,
  REFERRALBONUS,
  FLASH_COIN,
  GIFTOFLIVE,
  GIFTOFVIDEOCALL,
  VIPPLAN,
  FLASHVIPCOIN,
];

// eslint-disable-next-line no-undef
exports.HOST_TYPE = [(REAL = 1), (DUMMY = 2)];

exports.VIDEOTYPE = [(VIDEO = 0), (LINK = 1)];
exports.IMAGETYPE = [(IMAGE = 0), (LINK = 1)];
exports.PROFILEPIC_TYPE = [(IMAGE = 0), (LINK = 1)];
exports.LOGOTYPE = [(LOGO = 0), (LINK = 1)];

exports.AGENCY_TYPE = [(REAL = 1), (FAKE = 2)];

exports.MESSAGE_TYPE = [
  (IMAGE = 0),
  (VIDEO = 1),
  (AUDIO = 2),
  (CHAT = 3),
  (CHATGIFT = 4),
  (VIDEOCALL = 5),
];

exports.CALL_TYPE = [(RECIVE = 1), (DECLINE = 2), (MISCALL = 3)];

exports.LOGIN_TYPE = [(GOOGLE = 0), (FACEBOOK = 1), (QUICK = 2)];

exports.NOTIFICATION_TYPE = [(NADMIN = 0), (FEEDBACK = 1)]; // N for notification type

// settlement transaciton status
exports.TRANSACTION_STATUS = [(INITIATED = 1), (SUCCESSFULL_PAID = 2)];

// commission type
exports.COMMISSION_TYPE = [(AGENCTY_COMMISSION = 1)];

// story type
exports.STORY_TYPE = [(VIDEO = 1), (IMAGE = 2)];

// video type
exports.VIDEO_TYPE = [(FILE = 1), (LINK = 2)];
exports.PRIVIEW_TYPE = [(FILE = 1), (LINK = 2)];

// topic type
exports.TOPIC_TYPE = [
  (INTERESTEDTOPICS = 1),
  (IWNATYOURS = 2),
  (DESCRIBEMYSELF = 3),
  (MOREINFORMATION = 4),
];
