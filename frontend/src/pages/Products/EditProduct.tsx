import { useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import EditProductForm from "../../components/products/EditProductForm";

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <p className="text-sm text-error-500">Invalid product id.</p>;
  }

  return (
    <>
      <PageMeta title="Edit Product" description="Edit product details" />
      <PageBreadcrumb pageTitle="Edit Product" />
      <ComponentCard title="Edit Product">
        <EditProductForm productId={id} />
      </ComponentCard>
    </>
  );
}
