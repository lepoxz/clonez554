import { redirect } from "next/navigation";

// Trang /checkout không còn dùng nữa — thanh toán sản phẩm đã chuyển sang
// trả từ ví trực tiếp trong modal tại trang sản phẩm.
// Nạp tiền vào ví: /deposit
export default function CheckoutPage() {
  redirect("/deposit");
}
