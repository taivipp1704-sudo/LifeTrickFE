export const categories = {
  all: "Tất cả",
  life: "Mẹo đời sống",
  survival: "Sinh tồn",
  kitchen: "Nhà bếp",
  firstaid: "Sơ cứu",
  travel: "Dã ngoại",
  tech: "Công nghệ",
  diy: "Tự làm",
};
export const statuses = {
  DRAFT: "Bản nháp",
  SUBMITTED: "Chờ thẩm định",
  IN_REVIEW: "Đang thẩm định",
  CHANGES_REQUESTED: "Cần bổ sung",
  APPROVED: "Đã duyệt & xuất bản",
  REJECTED: "Từ chối",
};
export const normalize = (s) =>
  String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase();
export function emptyContent() {
  return {
    title: "",
    category: "life",
    description: "",
    tools: [],
    steps: [
      { title: "", body: "" },
      { title: "", body: "" },
      { title: "", body: "" },
    ],
    warning: "",
    sourceTitle: "",
    sourceUrl: "",
    model: "water",
    image: "forest",
  };
}
export function validateContent(c) {
  if (c.title.trim().length < 5) return "Tên mẹo cần ít nhất 5 ký tự.";
  if (!c.description.trim() || !c.tools.length)
    return "Hãy bổ sung mô tả và dụng cụ.";
  if (c.steps.some((s) => !s.title.trim() || !s.body.trim()))
    return "Cần đủ tiêu đề và nội dung của 3 bước.";
  if (
    c.warning.trim().length < 10 ||
    !c.sourceTitle.trim() ||
    !/^https:\/\/\S+$/.test(c.sourceUrl)
  )
    return "Cần lưu ý an toàn và nguồn tham khảo HTTPS.";
  return null;
}
