import React from "react";
import UserHeader from "./UserHeader";

const UserLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default UserLayout;
