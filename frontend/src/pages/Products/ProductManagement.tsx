import { useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import ProductTable from "../../components/products/ProductTable";

export default function ProductManagement() {
  const navigate = useNavigate();

  return (
    <>
      <PageMeta
        title="Product Management"
        description="Manage products in the catalog"
      />
      <PageBreadcrumb pageTitle="Product Management" />
      <div className="space-y-6">
        <ComponentCard
          title="Product Management Table"
          buttonTitle="Add Product"
          handleButtonClick={() => navigate("/product-management/add")}
        >
          <ProductTable />
        </ComponentCard>
      </div>
    </>
  );
}
