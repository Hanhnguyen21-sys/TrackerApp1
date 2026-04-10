import TopNavbar from "./NavBar";
import Sidebar from "./SideBar";

export default function DashboardLayout({
  children,
  user,
  logout,
  searchTerm,
  setSearchTerm,
  searchRef,
  showSearchDropdown,
  setShowSearchDropdown,
  searchSuggestions,
  navigate,
  activeView,
  setActiveView,
  setShowCreateModal,
}) {
  return (
    <div className="min-h-screen bg-[#1d2125] text-white">
      <TopNavbar
        logout={logout}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchRef={searchRef}
        showSearchDropdown={showSearchDropdown}
        setShowSearchDropdown={setShowSearchDropdown}
        searchSuggestions={searchSuggestions}
        navigate={navigate}
        activeView={activeView}
        setShowCreateModal={setShowCreateModal}
      />

      <div className="flex pt-16">
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          user={user}
        />

        <main className="flex-1 px-6 py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
