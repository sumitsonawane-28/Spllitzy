import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useExpenseStore } from "@/store/expenseStore";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useExpenseStore();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [user, navigate]);

  return null;
}
