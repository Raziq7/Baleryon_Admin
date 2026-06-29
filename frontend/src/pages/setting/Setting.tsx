import { Tabs } from "../../components/ui/tab/Tabs";
import ListCategory from "../../components/category/ListCategory";
import ListBrand from "../../components/brand/ListBrand";
import Coupon from "../../components/coupon/Coupon.tsx";


function Setting() {
  return (
    <>
      <Tabs
        tabs={[
          {
            id: "categories",
            label: "Category",
            content: <ListCategory />,
          },
          {
            id: "brands",
            label: "Brand",
            content: <ListBrand />,
          },

            {
            id: "coupon",
            label: "Coupon",
            content: <Coupon />,
          },
        ]}
      />
    </>
  );
}

export default Setting;
