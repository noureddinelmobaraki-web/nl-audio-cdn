// nlConfig.js — إعداد مفاتيح NL Cinema (الأفلام/المسلسلات)
// ملاحظة: مفاتيح TMDB/OMDb هي مفاتيح عامة مجانية ومخصّصة للاستخدام من جهة العميل،
// لذا تضمينها هنا آمن (نفس ما يفعله الموقع الأصلي). لا توجد أسرار خادمية هنا.
(function () {
	"use strict";

	// مفتاح TMDB (v3 auth) — مجاني وعام
	window.NL_TMDB_KEY = "c0e3af15af7876d116b37c4908a0fc67";

	// مفتاح OMDb (اختياري — يُستخدم فقط لإظهار تقييم IMDb في صفحة التفاصيل)
	// اتركه فارغًا إن لم يتوفر؛ التطبيق يعمل بالكامل بدونه عبر تقييم TMDB.
	window.NL_OMDB_KEY = "921985a1";

	try {
		console.log(
			"[NL] nlConfig loaded — TMDB:",
			window.NL_TMDB_KEY ? "present" : "missing",
			"| OMDb:",
			window.NL_OMDB_KEY ? "present" : "none"
		);
	} catch (e) {}
})();
