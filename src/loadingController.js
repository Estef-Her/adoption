let showLoading = () => {};
let hideLoading = () => {};

export const loadingController = {
  register(show, hide) {
    showLoading = show;
    hideLoading = hide;
  },
  show() {
    showLoading();
  },
  hide() {
    hideLoading();
  },
};
