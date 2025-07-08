// import Customer from "./pages/ServiceManger";
import Dashboard from "./pages/dashboard";
// import S_Transaction from "./pages/RentManager";
import Report from "./pages/reports";
import Setting from "./pages/setting";
// import RentManager from "./pages/RentManager";
import ServiceManager from "./pages/ServiceManger";
import Shopkeepers from "./pages/Athletes";
import StaffManager from "./pages/StaffManager";
import Incomes from "./pages/incomes";
import Expenses from "./pages/Expenses";
import BlockManager from "./pages/BlockManger";
import Agreements from "./pages/ActiveAthletes";
import Salaries from "./pages/Salaries";
import Rent from "./pages/RentManager";
import CreateUser from "./pages/CreateUsers";
import Residentialunites from "./pages/ResidentialUnites";
import Financial from "./pages/Financial";
import Fees from "./pages/Fees";
import Athletes from "./pages/Athletes";
import ActiveAthletes from "./pages/ActiveAthletes";
import FinanceComponent from "./pages/Financial";
const MainContent = ({ activeComponent }) => {
  const renderContent = () => {
    switch (activeComponent) {
      case "dashboard":
        return <Dashboard />;
      case "ActiveAthletes":
        return <ActiveAthletes />;
      case "BlockManager":
        return <BlockManager />;
      case "user managements":
        return <UserManagement />;
      case "report":
        return <Report />;
      case "Salaries":
        return <Salaries />;
      case "setting":
        return <Setting />;
      case "ServiceManager":
        return <ServiceManager />;
      case "Fees":
        return <Fees />;
      case "Athletes":
        return <Athletes />;
      case "Blockes":
        return <Residentialunites />;
      case "StafFManager":
        return <StaffManager />;
      case "Expenses":
        return <Expenses />;
      case "Incomes":
        return <Incomes />;
      case "financial":
        return <FinanceComponent />;
      case "CreateUsers":
        return <CreateUser />;
      case "BlockesServices":
        return <BlockManager />;
      case "RentManger":
        return <Rent />;
      default:
        return <Dashboard />;
    }
  };

  return <div className="min-h-[90vh]">{renderContent()}</div>;
};

export default MainContent;
