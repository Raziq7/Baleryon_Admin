import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Tabs } from "../../components/ui/tab/Tabs";
import ListBanner from "../../components/cms/banner/ListBanner";
import ListLimitedSeason from "../../components/cms/limitedSeason/ListLimitedSeason";
import ListUrbanStory from "../../components/cms/urbanStory/ListUrbanStory";
import ListJoinCommunity from "../../components/cms/joinCommunity/ListJoinCommunity";

export default function LandingPage() {
  return (
    <>
      <PageMeta
        title="Landing Page CMS"
        description="Manage landing page banners, limited season, urban stories, and community emails"
      />
      <PageBreadcrumb pageTitle="Landing Page" />
      <Tabs
        tabs={[
          { id: "banner", label: "Banner", content: <ListBanner /> },
          {
            id: "limited-season",
            label: "Limited Season",
            content: <ListLimitedSeason />,
          },
          {
            id: "urban-stories",
            label: "Urban Stories",
            content: <ListUrbanStory />,
          },
          {
            id: "join-community",
            label: "Join Community",
            content: <ListJoinCommunity />,
          },
        ]}
      />
    </>
  );
}
