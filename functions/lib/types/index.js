"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorSortBy = exports.NotificationType = exports.InquiryPriority = exports.InquiryStatus = exports.ServicePriceType = exports.PriceUnit = exports.VendorCategory = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "user";
    UserRole["VENDOR"] = "vendor";
    UserRole["ADMIN"] = "admin";
    UserRole["SUPER_ADMIN"] = "super_admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var VendorCategory;
(function (VendorCategory) {
    VendorCategory["PHOTOGRAPHER"] = "photographer";
    VendorCategory["VIDEOGRAPHER"] = "videographer";
    VendorCategory["VENUE"] = "venue";
    VendorCategory["CATERING"] = "catering";
    VendorCategory["FLOWERS"] = "flowers";
    VendorCategory["MUSIC"] = "music";
    VendorCategory["DECORATION"] = "decoration";
    VendorCategory["DRESS"] = "dress";
    VendorCategory["SUIT"] = "suit";
    VendorCategory["MAKEUP"] = "makeup";
    VendorCategory["HAIR"] = "hair";
    VendorCategory["TRANSPORT"] = "transport";
    VendorCategory["CAKE"] = "cake";
    VendorCategory["JEWELRY"] = "jewelry";
    VendorCategory["INVITATIONS"] = "invitations";
    VendorCategory["OTHER"] = "other";
})(VendorCategory || (exports.VendorCategory = VendorCategory = {}));
var PriceUnit;
(function (PriceUnit) {
    PriceUnit["PER_EVENT"] = "per_event";
    PriceUnit["PER_PERSON"] = "per_person";
    PriceUnit["PER_HOUR"] = "per_hour";
    PriceUnit["PER_DAY"] = "per_day";
    PriceUnit["PACKAGE"] = "package";
})(PriceUnit || (exports.PriceUnit = PriceUnit = {}));
var ServicePriceType;
(function (ServicePriceType) {
    ServicePriceType["FIXED"] = "fixed";
    ServicePriceType["PER_PERSON"] = "per_person";
    ServicePriceType["PER_HOUR"] = "per_hour";
    ServicePriceType["PER_DAY"] = "per_day";
    ServicePriceType["PACKAGE"] = "package";
    ServicePriceType["CUSTOM"] = "custom";
})(ServicePriceType || (exports.ServicePriceType = ServicePriceType = {}));
var InquiryStatus;
(function (InquiryStatus) {
    InquiryStatus["NEW"] = "new";
    InquiryStatus["VIEWED"] = "viewed";
    InquiryStatus["RESPONDED"] = "responded";
    InquiryStatus["QUOTED"] = "quoted";
    InquiryStatus["BOOKED"] = "booked";
    InquiryStatus["DECLINED"] = "declined";
    InquiryStatus["EXPIRED"] = "expired";
})(InquiryStatus || (exports.InquiryStatus = InquiryStatus = {}));
var InquiryPriority;
(function (InquiryPriority) {
    InquiryPriority["LOW"] = "low";
    InquiryPriority["NORMAL"] = "normal";
    InquiryPriority["HIGH"] = "high";
    InquiryPriority["URGENT"] = "urgent";
})(InquiryPriority || (exports.InquiryPriority = InquiryPriority = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["INQUIRY_RECEIVED"] = "inquiry_received";
    NotificationType["INQUIRY_RESPONSE"] = "inquiry_response";
    NotificationType["REVIEW_RECEIVED"] = "review_received";
    NotificationType["VENDOR_VERIFIED"] = "vendor_verified";
    NotificationType["VENDOR_FEATURED"] = "vendor_featured";
    NotificationType["SYSTEM_UPDATE"] = "system_update";
    NotificationType["PROMOTION"] = "promotion";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var VendorSortBy;
(function (VendorSortBy) {
    VendorSortBy["NAME"] = "name";
    VendorSortBy["CREATED_AT"] = "createdAt";
    VendorSortBy["RATING"] = "rating";
    VendorSortBy["PRICE"] = "price";
    VendorSortBy["POPULARITY"] = "popularity";
})(VendorSortBy || (exports.VendorSortBy = VendorSortBy = {}));
//# sourceMappingURL=index.js.map