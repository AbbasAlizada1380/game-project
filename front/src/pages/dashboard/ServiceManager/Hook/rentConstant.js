import moment from "moment-jalaali";

export const floors = [
  { value: 1, label: "طبقه اول" },
  { value: 2, label: "طبقه دوم" },
  { value: 3, label: "طبقه سوم" },
  { value: 4, label: "طبقه چهارم" },
  { value: 5, label: "طبقه پنجم" },
  { value: 6, label: "تهکوی" },
];

export const months = [
  { value: 1, label: "حمل" },
  { value: 2, label: "ثور" },
  { value: 3, label: "جوزا" },
  { value: 4, label: "سرطان" },
  { value: 5, label: "اسد" },
  { value: 6, label: "سنبله" },
  { value: 7, label: "میزان" },
  { value: 8, label: "عقرب" },
  { value: 9, label: "قوس" },
  { value: 10, label: "جدی" },
  { value: 11, label: "دلو" },
  { value: 12, label: "حوت" },
];

export const currentYear = moment().jYear(); // Export this separately

export const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
