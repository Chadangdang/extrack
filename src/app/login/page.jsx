"use client";
import React from "react";
import { PieChart, Pie, Cell } from "recharts";

export default function HomePage() {
  // Demo data
  const data = [
    { name: "Bill", value: 25, color: "#9CA3DB" },
    { name: "Food", value: 25, color: "#F7C9E3" },
    { name: "Shopping", value: 50, color: "#D1B4E8" },
  ];

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "400px",
        margin: "0 auto",
        backgroundColor: "#FBF3EB",
        fontFamily: "Arial, sans-serif",
        color: "#7A4A2A",
        border: "1px solid #C9A880",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          backgroundColor: "#E7CBAE",
          height: "30px",
        }}
      ></div>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F2DFC8",
          padding: "10px 0",
          fontWeight: "bold",
          fontSize: "16px",
        }}
      >
        <span style={{ marginRight: "8px" }}>⏪</span>
        <span>NOVEMBER 2025</span>
        <span style={{ marginLeft: "8px" }}>⏩</span>
      </div>

      {/* Pie Chart */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
        <PieChart width={200} height={200}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={90}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </div>

      {/* Income / Expense / Balance */}
      <div style={{ textAlign: "center", marginTop: "5px" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              backgroundColor: "#B6D9B6",
              border: "1px solid #333",
              width: "130px",
              padding: "5px",
            }}
          >
            Income<br />1,000.00฿
          </div>
          <div
            style={{
              backgroundColor: "#E6B6B6",
              border: "1px solid #333",
              width: "130px",
              padding: "5px",
            }}
          >
            Expense<br />250.00฿
          </div>
        </div>
        <div
          style={{
            backgroundColor: "#EAEAEA",
            border: "1px solid #333",
            width: "260px",
            margin: "auto",
            padding: "5px",
            fontWeight: "bold",
          }}
        >
          Balance 750.00฿
        </div>
      </div>

      {/* Recently Added */}
      <div
        style={{
          border: "1px solid #C9A880",
          margin: "20px auto",
          width: "90%",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "5px", color: "#7A4A2A" }}>
          Recently Added
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", margin: "5px 0" }}>
          <span>1 Water bill</span>
          <span style={{ backgroundColor: "#B8C4E4", padding: "2px 5px", borderRadius: "4px" }}>Bill</span>
          <span style={{ color: "red" }}>-100.00฿</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", margin: "5px 0" }}>
          <span>2 Clothes</span>
          <span style={{ backgroundColor: "#D1B4E8", padding: "2px 5px", borderRadius: "4px" }}>Shopping</span>
          <span style={{ color: "red" }}>-100.00฿</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", margin: "5px 0" }}>
          <span>3 Noodles</span>
          <span style={{ backgroundColor: "#F7C9E3", padding: "2px 5px", borderRadius: "4px" }}>Food</span>
          <span style={{ color: "red" }}>-50.00฿</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", margin: "5px 0" }}>
          <span>4 Salary Oct25</span>
          <span style={{ backgroundColor: "#B6D9B6", padding: "2px 5px", borderRadius: "4px" }}>Salary</span>
          <span style={{ color: "green" }}>+1,000.00฿</span>
        </div>

        <div style={{ textAlign: "right", marginTop: "5px" }}>
          <a href="#" style={{ color: "#A1662F", fontWeight: "bold", textDecoration: "none" }}>
            see more &gt;&gt;
          </a>
        </div>
      </div>

      {/* Bottom Add Button */}
      <div
        style={{
          marginTop: "auto",
          backgroundColor: "#E7CBAE",
          height: "60px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            backgroundColor: "#FBF3EB",
            borderRadius: "50%",
            width: "45px",
            height: "45px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "2px solid #A1662F",
            fontSize: "24px",
            color: "#A1662F",
            fontWeight: "bold",
          }}
        >
          +
        </div>
      </div>
    </div>
  );
}
