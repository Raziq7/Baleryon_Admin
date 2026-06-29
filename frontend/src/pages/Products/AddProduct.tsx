import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import AddProductForm from "../../components/products/AddProductForm";

export default function AddProduct() {
  return (
    <>
      <PageMeta
        title="Add Product"
        description="Add a new product to the catalog"
      />
      <PageBreadcrumb pageTitle="Add Product" />
      <div className="space-y-6">
        <ComponentCard title="Product Details">
          <AddProductForm />
        </ComponentCard>
      </div>
    </>
  );
}
