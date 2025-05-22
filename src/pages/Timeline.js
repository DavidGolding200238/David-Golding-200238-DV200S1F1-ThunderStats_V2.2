import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { NavLink } from "react-router-dom";
import "../styles/Global.css";
import { fetchAllVehiclesPaginated, fetchVehicleDetails } from "../api/WarthunderApi";
import { VehiclePanel } from "./Comparisonpage";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TimelinePage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [liveVehicleData, setLiveVehicleData] = useState(null);
  const [versionOptions, setVersionOptions] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState("BR");
  const [activeTab, setActiveTab] = useState("graph");
  const [selectedBR, setSelectedBR] = useState("Realistic");
  const [isGroundBattle, setIsGroundBattle] = useState(false);

  useEffect(() => {
    async function loadVersionOptions() {
      try {
        const response = await fetch(
          "https://www.wtvehiclesapi.sgambe.serv00.net/api/vehicles/stats"
        );
        if (!response.ok) throw new Error("Failed to fetch vehicle stats");
        const stats = await response.json();
        setVersionOptions(stats.versions || []);
      } catch (err) {
        console.error("Error fetching version options:", err);
      }
    }
    loadVersionOptions();
  }, []);

  useEffect(() => {
    async function loadVehicles() {
      const data = await fetchAllVehiclesPaginated();
      setVehicles(data);
      setFilteredVehicles(data);
      if (data.length > 0 && !selectedVehicle) {
        setSelectedVehicle(data[0].identifier);
      }
    }
    loadVehicles();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = vehicles.filter((v) =>
      v.identifier.toLowerCase().includes(query)
    );
    setFilteredVehicles(filtered);
  }, [searchQuery, vehicles]);

  useEffect(() => {
    async function loadLiveData() {
      if (!selectedVehicle) {
        setLiveVehicleData(null);
        setHistoricalData([]);
        return;
      }
      const data = await fetchVehicleDetails(selectedVehicle);
      setLiveVehicleData(data);
    }
    loadLiveData();
  }, [selectedVehicle]);

  useEffect(() => {
    async function loadHistoricalData() {
      if (!selectedVehicle || versionOptions.length === 0) {
        setHistoricalData([]);
        return;
      }
      const responses = await Promise.all(
        versionOptions.map((v) => fetchVehicleDetails(selectedVehicle, v))
      );
      const mapped = responses.map((data, index) => ({
        version: versionOptions[index],
        realistic_br: data ? data.realistic_br : null,
        repair_cost: data ? data.repair_cost_realistic : null,
        era: data ? data.era : null,
      }));
      setHistoricalData(mapped);
    }
    loadHistoricalData();
  }, [selectedVehicle, versionOptions]);

  let datasets = [];
  if (selectedDataset === "BR") {
    datasets.push({
      label: "Historical Realistic BR",
      data: historicalData.map((item) => item.realistic_br),
      fill: false,
      borderColor: "rgba(75, 192, 192, 1)",
      tension: 0.1,
      pointRadius: 4,
      spanGaps: true,
    });
  } else if (selectedDataset === "Repair") {
    datasets.push({
      label: "Historical Repair Costs",
      data: historicalData.map((item) => item.repair_cost),
      fill: false,
      borderColor: "rgba(192, 75, 192, 1)",
      tension: 0.1,
      pointRadius: 4,
      spanGaps: true,
    });
  } else if (selectedDataset === "Rank") {
    datasets.push({
      label: "Historical Rank Changes",
      data: historicalData.map((item) => item.era),
      fill: false,
      borderColor: "rgba(192, 192, 75, 1)",
      tension: 0.1,
      pointRadius: 4,
      spanGaps: true,
    });
  }

  const lineChartData = {
    labels: historicalData.map((item) => item.version),
    datasets: datasets,
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y}`,
        },
        bodyFont: { size: 14 },
        titleFont: { size: 16 },
      },
      legend: {
        position: "top",
        labels: { color: "#e0e0e0", font: { size: 16 } },
      },
      title: {
        display: true,
        text: "Historical Data Progression",
        color: "#e0e0e0",
        font: { size: 20 },
      },
    },
    scales: {
      x: { ticks: { color: "#e0e0e0", font: { size: 14 } } },
      y: { ticks: { color: "#e0e0e0", font: { size: 14 } } },
    },
  };

  return (
    <div className="timeline">
      <div className="pattern"></div>
      <nav className="nav">
        <div className="nav_brand">ThunderStats</div>
        <ul className="nav_links">
          <li>
            <NavLink to="/" activeClassName="nav_link_active">
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/compare" activeClassName="nav_link_active">
              Compare
            </NavLink>
          </li>
          <li>
            <NavLink to="/timeline" activeClassName="nav_link_active">
              Timeline
            </NavLink>
          </li>
        </ul>
        <div></div>
      </nav>
      <main>
        <h1>Vehicle History</h1>
        <div className="selection">
          <div className="selection_row">
            <div className="selection_group">
              <label className="form_label">Select Vehicle</label>
              <input
                type="text"
                placeholder="Search for a vehicle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form_input"
              />
            </div>
            <div className="selection_group">
              <label className="form_label">Select Stat to Track</label>
              <select
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                disabled={!selectedVehicle}
                className="form_select"
              >
                <option value="BR">Battle Rating</option>
                <option value="Repair">Repair Cost</option>
                <option value="Rank">Rank</option>
              </select>
            </div>
            <div className="selection_group">
              <label className="form_label">BR Settings</label>
              <select
                value={selectedBR}
                onChange={(e) => setSelectedBR(e.target.value)}
                className="form_select"
              >
                <option value="Arcade">Arcade</option>
                <option value="Realistic">Realistic</option>
                <option value="Simulator">Simulator</option>
              </select>
              <div className="selection_group_checkbox">
                <input
                  type="checkbox"
                  checked={isGroundBattle}
                  onChange={(e) => setIsGroundBattle(e.target.checked)}
                  className="filter_checkbox"
                />
                <label>Ground Battle</label>
              </div>
            </div>
          </div>
        </div>
        {liveVehicleData ? (
          <div className="content_grid">
            <VehiclePanel
              vehicle={liveVehicleData}
              vehicles={filteredVehicles}
              onSelectChange={(e) => setSelectedVehicle(e.target.value)}
              selectedBR={selectedBR}
              isGroundBattle={isGroundBattle}
            />
            <div className="history">
              <h3>Historical Changes</h3>
              <div className="tabs">
                <button
                  className={`tab ${activeTab === "graph" ? "tab_active" : ""}`}
                  onClick={() => setActiveTab("graph")}
                >
                  Graph
                </button>
                <button
                  className={`tab ${activeTab === "timeline" ? "tab_active" : ""}`}
                  onClick={() => setActiveTab("timeline")}
                >
                  Timeline
                </button>
              </div>
              {activeTab === "graph" ? (
                <div>
                  {historicalData.length > 0 ? (
                    <div className="chart_timeline">
                      <Line data={lineChartData} options={lineChartOptions} />
                    </div>
                  ) : (
                    <div className="placeholder">
                      <p>No historical data available for this vehicle.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {historicalData.length > 0 ? (
                    <div>
                      {historicalData.map((item, index) => (
                        <div key={index} className="history_item">
                          <div className="history_header">
                            <h4>{item.version}</h4>
                            <span>{item.date || "Unknown Date"}</span>
                          </div>
                          <div className="history_changes">
                            {item.realistic_br && (
                              <div className="history_change">
                                <div className="category">Battle Rating</div>
                                <div className="status">Changed</div>
                                <div className="description">
                                  Realistic Battle Rating updated.
                                </div>
                                <div className="history_values">
                                  <div className="before">
                                    <span>Before:</span>
                                    <span>
                                      {historicalData[index - 1]?.realistic_br ||
                                        "N/A"}
                                    </span>
                                  </div>
                                  <div className="after">
                                    <span>After:</span>
                                    <span>{item.realistic_br}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            {item.repair_cost && (
                              <div className="history_change">
                                <div className="category">Repair Cost</div>
                                <div className="status">Changed</div>
                                <div className="description">
                                  Repair cost updated.
                                </div>
                                <div className="history_values">
                                  <div className="before">
                                    <span>Before:</span>
                                    <span>
                                      {historicalData[index - 1]?.repair_cost ||
                                        "N/A"}
                                    </span>
                                  </div>
                                  <div className="after">
                                    <span>After:</span>
                                    <span>{item.repair_cost}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            {item.era && (
                              <div className="history_change">
                                <div className="category">Rank</div>
                                <div className="status">Changed</div>
                                <div className="description">Rank updated.</div>
                                <div className="history_values">
                                  <div className="before">
                                    <span>Before:</span>
                                    <span>
                                      {historicalData[index - 1]?.era || "N/A"}
                                    </span>
                                  </div>
                                  <div className="after">
                                    <span>After:</span>
                                    <span>{item.era}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="placeholder">
                      <p>No historical data available for this vehicle.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="placeholder">
            <p>Select a vehicle to see historical changes</p>
          </div>
        )}
      </main>
      <footer className="footer">
        <p>© 2025 ThunderStats. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default TimelinePage;