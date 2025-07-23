import { Navigate, useParams } from "react-router-dom";

export const RedirectToAdminContact = () => {
  const { id } = useParams();
  return <Navigate to={`/admin/contact/${id}`} replace />;
};

export const RedirectToClientContact = () => {
  const { id } = useParams();
  return <Navigate to={`/user/contact/${id}`} replace />;
};
