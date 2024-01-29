export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => document.querySelectorAll(selector);
export const SS = {
  set: (key, value) => sessionStorage.setItem(key, value),
  get: (key) => sessionStorage.getItem(key) || "",
  remove: (key) => sessionStorage.removeItem(key),
};
