import { Route, Switch } from "wouter";
import { Provider } from "./components/provider";
import { AgentFeedback, RunableBadge } from "@runablehq/website-runtime";

// Pages
import Landing from "./pages/Landing";
import CountryClub from "./pages/CountryClub";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Onboarding from "./pages/Onboarding";
import Discover from "./pages/Discover";
import Chat from "./pages/Chat";
import ChatRoom from "./pages/ChatRoom";
import Guardian from "./pages/Guardian";
import Profile from "./pages/Profile";
import ProfileView from "./pages/ProfileView";
import Match from "./pages/Match";
import Meetups from "./pages/Meetups";
import MeetupDetail from "./pages/MeetupDetail";
import CreateEvent from "./pages/CreateEvent";
import Premium from "./pages/Premium";
import Verification from "./pages/Verification";
import VerificationSelfie from "./pages/VerificationSelfie";
import VerificationId from "./pages/VerificationId";
import VerificationStatus from "./pages/VerificationStatus";
import VirtualDate from "./pages/VirtualDate";
import VirtualDatePrompts from "./pages/VirtualDatePrompts";
import ZenMode from "./pages/ZenMode";
import Invite from "./pages/Invite";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminRevenue from "./pages/admin/AdminRevenue";
import AdminVerification from "./pages/admin/AdminVerification";
import MarshalDashboard from "./pages/marshal/MarshalDashboard";
import OrganiserDashboard from "./pages/organiser/OrganiserDashboard";
import AttendeeDashboard from "./pages/attendees/AttendeeDashboard";
import SparkWallet from "./pages/SparkWallet";

function App() {
  return (
    <Provider>
      <Switch>
        {/* Public */}
        <Route path="/" component={Landing} />
        <Route path="/country-club" component={CountryClub} />
        <Route path="/auth/login" component={Login} />
        <Route path="/auth/register" component={Register} />

        {/* Onboarding */}
        <Route path="/onboarding" component={Onboarding} />

        {/* Core user flows */}
        <Route path="/discover" component={Discover} />
        <Route path="/match/:id" component={Match} />
        <Route path="/chat" component={Chat} />
        <Route path="/chat/:id" component={ChatRoom} />
        <Route path="/guardian" component={Guardian} />

        {/* Profile */}
        <Route path="/profile" component={Profile} />
        <Route path="/profile/:id" component={ProfileView} />

        {/* Verification */}
        <Route path="/verification" component={Verification} />
        <Route path="/verification/selfie" component={VerificationSelfie} />
        <Route path="/verification/id" component={VerificationId} />
        <Route path="/verification/status" component={VerificationStatus} />

        {/* Events */}
        <Route path="/meetups" component={Meetups} />
        <Route path="/meetups/:id" component={MeetupDetail} />
        <Route path="/events/create" component={CreateEvent} />
        <Route path="/attendees" component={AttendeeDashboard} />

        {/* Premium & Social */}
        <Route path="/premium" component={Premium} />
        <Route path="/virtual-date" component={VirtualDate} />
        <Route path="/virtual-date/prompts" component={VirtualDatePrompts} />
        <Route path="/zen" component={ZenMode} />
        <Route path="/invite" component={Invite} />

        {/* Admin */}
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/revenue" component={AdminRevenue} />
        <Route path="/admin/verification" component={AdminVerification} />

        {/* Spark Wallet */}
        <Route path="/spark-wallet" component={SparkWallet} />

        {/* Roles */}
        <Route path="/marshal" component={MarshalDashboard} />
        <Route path="/organiser" component={OrganiserDashboard} />

        {/* Fallback */}
        <Route>{() => <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>404 — No spark here.</div>}</Route>
      </Switch>

      {import.meta.env.DEV && <AgentFeedback />}
      {<RunableBadge />}
    </Provider>
  );
}

export default App;
