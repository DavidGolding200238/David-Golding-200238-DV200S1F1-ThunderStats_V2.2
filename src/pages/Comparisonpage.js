import React, { useState, useEffect } from "react";
import { Bar, Radar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { NavLink } from "react-router-dom";
import "../styles/Global.css";
import { fetchAllVehiclesPaginated, fetchVehicleDetails } from "../api/WarthunderApi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const getVehicleImage = (vehicle) => {
  if (!vehicle || !vehicle.images) return "https://via.placeholder.com/200";
  return (
    vehicle.images.image ||
    vehicle.images.preview_image ||
    vehicle.images.image_2 ||
    vehicle.images.image_3 ||
    vehicle.images.thumbnail ||
    "https://via.placeholder.com/200"
  );
};

const getVehicleSpeed = (vehicle) => {
  if (vehicle) {
    if (vehicle.engine && Number(vehicle.engine.max_speed_rb_sb) > 0) {
      return Number(vehicle.engine.max_speed_rb_sb);
    }
    if (
      vehicle.aerodynamics &&
      Number(vehicle.aerodynamics.max_speed_at_altitude) > 0
    ) {
      return Number(vehicle.aerodynamics.max_speed_at_altitude);
    }
  }
  return 0;
};

const getVehicleMass = (vehicle) =>
  vehicle && vehicle.mass ? Number(vehicle.mass) : 0;
const getVehicleCost = (vehicle) =>
  vehicle && vehicle.value ? Number(vehicle.value) : 0;
const getVehicleRepairCost = (vehicle) =>
  vehicle && vehicle.repair_cost_arcade ? Number(vehicle.repair_cost_arcade) : 0;
const getVehicleCrewCount = (vehicle) =>
  vehicle && vehicle.crew_total_count ? Number(vehicle.crew_total_count) : 0;
const getVehicleResearch = (vehicle) =>
  vehicle && vehicle.req_exp ? Number(vehicle.req_exp) : 0;

const getMetricValue = (vehicle, metric) => {
  if (!vehicle) return 0;
  if (metric === "Mass") return getVehicleMass(vehicle) / 1000;
  if (metric === "Repair") return getVehicleRepairCost(vehicle);
  if (metric === "Crew") return getVehicleCrewCount(vehicle);
  if (metric === "Research") return getVehicleResearch(vehicle);
  return 0;
};

const getMaxMetricValue = (vehicle1, vehicle2, metric, useNormalized) => {
  const val1 = getMetricValue(vehicle1, metric);
  const val2 = getMetricValue(vehicle2, metric);
  const maxRaw = Math.max(val1, val2);
  if (useNormalized) {
    const maxValues = {
      mass: 10000 / 1000,
      repair: 2000,
      crew: 10,
      research: 10000,
    };
    return maxValues[metric.toLowerCase()] || 1;
  }
  return maxRaw * 1.2;
};

export function VehiclePanel({
  vehicle,
  vehicles,
  onSelectChange,
  selectedBR,
  isGroundBattle,
}) {
  const displayBR = (() => {
    if (!vehicle) return "N/A";
    const type = vehicle.vehicle_type ? vehicle.vehicle_type.toLowerCase() : "";
    if (type === "fighter" || type === "plane") {
      if (isGroundBattle) {
        if (selectedBR === "Arcade") return vehicle.arcade_br;
        if (selectedBR === "Realistic") return vehicle.realistic_ground_br;
        if (selectedBR === "Simulator") return vehicle.simulator_ground_br;
      } else {
        if (selectedBR === "Arcade") return vehicle.arcade_br;
        if (selectedBR === "Realistic") return vehicle.realistic_br;
        if (selectedBR === "Simulator") return vehicle.simulator_br;
      }
    } else {
      if (selectedBR === "Arcade") return vehicle.arcade_br;
      if (selectedBR === "Realistic") return vehicle.realistic_br;
      if (selectedBR === "Simulator") return vehicle.simulator_br;
    }
    return "N/A";
  })();

  return (
    <div className="vehicle card">
      <h2>{vehicle ? vehicle.identifier : "Select Vehicle"}</h2>
      <img src={getVehicleImage(vehicle)} alt={vehicle ? vehicle.identifier : "Vehicle"} />
      <table className="info">
        <tbody>
          <tr>
            <td><strong>Country:</strong></td>
            <td>{vehicle ? vehicle.country : "N/A"}</td>
          </tr>
          <tr>
            <td><strong>Tier:</strong></td>
            <td>{vehicle ? vehicle.era : "N/A"}</td>
          </tr>
          <tr>
            <td><strong>Type:</strong></td>
            <td>{vehicle ? vehicle.vehicle_type : "N/A"}</td>
          </tr>
          <tr>
            <td><strong>Premium:</strong></td>
            <td>{vehicle ? (vehicle.is_premium ? "Yes" : "No") : "N/A"}</td>
          </tr>
          <tr>
            <td><strong>BR:</strong></td>
            <td>{displayBR}</td>
          </tr>
        </tbody>
      </table>
      <label className="form_label">Select Vehicle:</label>
      <select
        value={vehicle ? vehicle.identifier : ""}
        onChange={onSelectChange}
        className="form_select"
      >
        <option value="">Choose Vehicle</option>
        {vehicles.map((v) => (
          <option key={v.identifier} value={v.identifier}>
            {v.identifier} ({v.country})
          </option>
        ))}
      </select>
    </div>
  );
}

function ComparisonPage() {
  const [vehicles, setVehicles] = useState([]);
  const [vehicle1, setVehicle1] = useState("");
  const [vehicle2, setVehicle2] = useState("");
  const [vehicle1Details, setVehicle1Details] = useState(null);
  const [vehicle2Details, setVehicle2Details] = useState(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState("All");
  const [selectedNation1, setSelectedNation1] = useState("All");
  const [selectedNation2, setSelectedNation2] = useState("All");
  const [selectedBR, setSelectedBR] = useState("Arcade");
  const [isGroundBattle, setIsGroundBattle] = useState(false);
  const [selectedChart, setSelectedChart] = useState("speed");
  const [searchQuery1, setSearchQuery1] = useState("");
  const [searchQuery2, setSearchQuery2] = useState("");
  const allMetrics = ["Mass", "Repair", "Crew", "Research"];
  const [selectedMetrics, setSelectedMetrics] = useState(allMetrics);
  const [useNormalized, setUseNormalized] = useState(true);

  useEffect(() => {
    async function loadVehicles() {
      const data = await fetchAllVehiclesPaginated();
      setVehicles(data);
    }
    loadVehicles();
  }, []);

  useEffect(() => {
    async function loadVehicle1Details() {
      if (vehicle1) {
        const details = await fetchVehicleDetails(vehicle1);
        setVehicle1Details(details);
      } else {
        setVehicle1Details(null);
      }
    }
    loadVehicle1Details();
  }, [vehicle1]);

  useEffect(() => {
    async function loadVehicle2Details() {
      if (vehicle2) {
        const details = await fetchVehicleDetails(vehicle2);
        setVehicle2Details(details);
      } else {
        setVehicle2Details(null);
      }
    }
    loadVehicle2Details();
  }, [vehicle2]);

  const nations =
    vehicles.length > 0
      ? ["All", ...Array.from(new Set(vehicles.map((v) => v.country.toLowerCase())))]
      : ["All"];

  const normalizeString = (str) => str.replace(/_/g, " ").toLowerCase();

  const aircraftTypes = [
    "fighter",
    "bomber",
    "interceptor",
    "jet",
    "strike_aircraft",
    "attacker",
    "assault",
  ];
  const navalTypes = [
    "ship",
    "boat",
    "destroyer",
    "frigate",
    "naval",
    "heavy_cruiser",
    "coastal_ship",
  ];

  const filteredVehicles1 = vehicles.filter((v) => {
    const typeLower = v.vehicle_type ? v.vehicle_type.toLowerCase() : "";
    const subTypesLower = v.vehicle_sub_types
      ? v.vehicle_sub_types.map((s) => s.toLowerCase())
      : [];
    const typeMatch =
      selectedVehicleType === "All" ||
      (selectedVehicleType === "Plane" &&
        (aircraftTypes.includes(typeLower) ||
          subTypesLower.some((s) => aircraftTypes.includes(s)))) ||
      (selectedVehicleType === "Naval" &&
        (navalTypes.includes(typeLower) ||
          subTypesLower.some((s) => navalTypes.includes(s)))) ||
      (typeLower.includes(selectedVehicleType.toLowerCase()) ||
        subTypesLower.includes(selectedVehicleType.toLowerCase()));
    const nationMatch =
      selectedNation1 === "All" ||
      (v.country && v.country.toLowerCase() === selectedNation1.toLowerCase());
    const normalizedId = normalizeString(v.identifier);
    const normalizedQuery = normalizeString(searchQuery1);
    const searchMatch =
      normalizedQuery === "" ||
      new RegExp("\\b" + normalizedQuery).test(normalizedId);
    return typeMatch && nationMatch && searchMatch;
  });

  const filteredVehicles2 = vehicles.filter((v) => {
    const typeLower = v.vehicle_type ? v.vehicle_type.toLowerCase() : "";
    const subTypesLower = v.vehicle_sub_types
      ? v.vehicle_sub_types.map((s) => s.toLowerCase())
      : [];
    const typeMatch =
      selectedVehicleType === "All" ||
      (selectedVehicleType === "Plane" &&
        (aircraftTypes.includes(typeLower) ||
          subTypesLower.some((s) => aircraftTypes.includes(s)))) ||
      (selectedVehicleType === "Naval" &&
        (navalTypes.includes(typeLower) ||
          subTypesLower.some((s) => navalTypes.includes(s)))) ||
      (typeLower.includes(selectedVehicleType.toLowerCase()) ||
        subTypesLower.includes(selectedVehicleType.toLowerCase()));
    const nationMatch =
      selectedNation2 === "All" ||
      (v.country && v.country.toLowerCase() === selectedNation2.toLowerCase());
    const normalizedId = normalizeString(v.identifier);
    const normalizedQuery = normalizeString(searchQuery2);
    const searchMatch =
      normalizedQuery === "" ||
      new RegExp("\\b" + normalizedQuery).test(normalizedId);
    return typeMatch && nationMatch && searchMatch;
  });

  const handleVehicleTypeChange = (e) => {
    const type = e.target.value;
    setSelectedVehicleType(type);
    if (type !== "All") {
      if (
        !vehicles.find((v) =>
          v.identifier === vehicle1 &&
          v.vehicle_type.toLowerCase().includes(type.toLowerCase())
        )
      ) {
        setVehicle1("");
      }
      if (
        !vehicles.find((v) =>
          v.identifier === vehicle2 &&
          v.vehicle_type.toLowerCase().includes(type.toLowerCase())
        )
      ) {
        setVehicle2("");
      }
    }
  };

  const handleMetricToggle = (metric) => {
    if (selectedMetrics.includes(metric)) {
      setSelectedMetrics(selectedMetrics.filter((m) => m !== metric));
    } else {
      setSelectedMetrics([...selectedMetrics, metric]);
    }
  };

  const getRadarData = (vehicleDetails, useNormalized) => {
    if (!vehicleDetails) return [];
    return selectedMetrics.map((metric) => {
      const rawValue = getMetricValue(vehicleDetails, metric);
      if (useNormalized) {
        const maxValue = getMaxMetricValue(
          vehicle1Details,
          vehicle2Details,
          metric,
          true
        );
        return (rawValue / maxValue) * 10;
      }
      const maxValue = getMaxMetricValue(
        vehicle1Details,
        vehicle2Details,
        metric,
        false
      );
      return (rawValue / maxValue) * 10;
    });
  };

  const radarData1 = getRadarData(vehicle1Details, useNormalized);
  const radarData2 = getRadarData(vehicle2Details, useNormalized);

  return (
    <div className="comparison">
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
        <h1>Vehicle Comparison</h1>
        <div className="filters">
          <div className="filter">
            <label className="form_label">Vehicle Type</label>
            <select
              value={selectedVehicleType}
              onChange={handleVehicleTypeChange}
              className="form_select"
            >
              <option value="All">All</option>
              <option value="Tank">Tank</option>
              <option value="Helicopter">Helicopter</option>
              <option value="Plane">Plane</option>
              <option value="Naval">Naval</option>
              <option value="Battlecruiser">Battlecruiser</option>
            </select>
          </div>
          <div className="filter">
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
          </div>
          <div className="filter">
            <label>
              <input
                type="checkbox"
                checked={isGroundBattle}
                onChange={(e) => setIsGroundBattle(e.target.checked)}
                className="filter_checkbox"
              />
              Ground Battle
            </label>
          </div>
        </div>
        <div className="vehicle_grid">
          <div className="card">
            <div className="card_top">
              <div className="nation_filter">
                <label className="form_label">Select Nation:</label>
                <select
                  value={selectedNation1}
                  onChange={(e) => setSelectedNation1(e.target.value)}
                  className="form_select"
                >
                  {nations.map((nation) => (
                    <option key={nation} value={nation}>
                      {nation.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="search_bar">
                <label className="form_label">Search:</label>
                <input
                  type="text"
                  placeholder="Search for a vehicle..."
                  value={searchQuery1}
                  onChange={(e) => setSearchQuery1(e.target.value)}
                  className="form_input"
                />
              </div>
            </div>
            {vehicle1Details ? (
              <VehiclePanel
                vehicle={vehicle1Details}
                vehicles={filteredVehicles1}
                onSelectChange={(e) => setVehicle1(e.target.value)}
                selectedBR={selectedBR}
                isGroundBattle={isGroundBattle}
              />
            ) : (
              <div
                className="vehicle_placeholder"
                onClick={() => setVehicle1(vehicles[0]?.identifier || "")}
              >
                <p>Click to select a vehicle</p>
              </div>
            )}
          </div>
          {vehicle1Details && vehicle2Details ? (
            <div className="radar_grid_item">
              <div className="radar">
                <h3>Radar Analysis</h3>
                <div className="tab_frame">
                  <button className="button_radar" onClick={() => setSelectedChart("speed")}>Speed</button>
                  <button className="button_radar" onClick={() => setSelectedChart("mass")}>Mass</button>
                  <button className="button_radar" onClick={() => setSelectedChart("cost")}>Cost</button>
                  <button className="button_radar" onClick={() => setSelectedChart("overall")}>
                    Overall Specs
                  </button>
                </div>
                <div className="chart">
                  {selectedChart === "speed" && (
                    <Bar
                      data={{
                        labels: ["Speed"],
                        datasets: [
                          {
                            label: vehicle1Details.identifier,
                            data: [getVehicleSpeed(vehicle1Details)],
                            backgroundColor: "rgba(255, 99, 132, 0.8)",
                            borderColor: "#FF6384",
                            borderWidth: 2,
                          },
                          {
                            label: vehicle2Details.identifier,
                            data: [getVehicleSpeed(vehicle2Details)],
                            backgroundColor: "rgba(255, 205, 86, 0.8)",
                            borderColor: "#FFCD56",
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: "top", labels: { color: "white" } },
                          tooltip: { enabled: true },
                        },
                        scales: {
                          x: { ticks: { color: "white" }, grid: { color: "white" } },
                          y: { ticks: { color: "white" }, grid: { color: "white" } },
                        },
                      }}
                      style={{ height: "400px" }}
                    />
                  )}
                  {selectedChart === "mass" && (
                    <Pie
                      data={{
                        labels: [
                          vehicle1Details.identifier,
                          vehicle2Details.identifier,
                        ],
                        datasets: [
                          {
                            data: [
                              getVehicleMass(vehicle1Details),
                              getVehicleMass(vehicle2Details),
                            ],
                            backgroundColor: [
                              "rgba(255, 99, 132, 0.8)",
                              "rgba(255, 205, 86, 0.8)",
                            ],
                            borderColor: ["#FF6384", "#FFCD56"],
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: "top", labels: { color: "white" } },
                          tooltip: {
                            callbacks: {
                              label: function (context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce(
                                  (sum, val) => sum + val,
                                  0
                                );
                                const percent = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${value} kg (${percent}%)`;
                              },
                            },
                          },
                        },
                      }}
                      style={{ height: "400px" }}
                    />
                  )}
                  {selectedChart === "cost" && (
                    <Bar
                      data={{
                        labels: ["Cost"],
                        datasets: [
                          {
                            label: vehicle1Details.identifier,
                            data: [getVehicleCost(vehicle1Details)],
                            backgroundColor: "rgba(255, 99, 132, 0.8)",
                            borderColor: "#FF6384",
                            borderWidth: 2,
                          },
                          {
                            label: vehicle2Details.identifier,
                            data: [getVehicleCost(vehicle2Details)],
                            backgroundColor: "rgba(255, 205, 86, 0.8)",
                            borderColor: "#FFCD56",
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: "top", labels: { color: "white" } },
                          tooltip: { enabled: true },
                        },
                        scales: {
                          x: { ticks: { color: "white" }, grid: { color: "white" } },
                          y: { ticks: { color: "white" }, grid: { color: "white" } },
                        },
                      }}
                      style={{ height: "400px" }}
                    />
                  )}
                  {selectedChart === "overall" && (
                    <Radar
                      data={{
                        labels: selectedMetrics,
                        datasets: [
                          {
                            label: vehicle1Details.identifier,
                            data: radarData1,
                            backgroundColor: "rgba(255, 99, 132, 0.3)",
                            borderColor: "#FF6384",
                            pointBackgroundColor: "#FF6384",
                            pointRadius: 8,
                            pointHoverRadius: 10,
                            fill: true,
                          },
                          {
                            label: vehicle2Details.identifier,
                            data: radarData2,
                            backgroundColor: "rgba(255, 205, 86, 0.3)",
                            borderColor: "#FFCD56",
                            pointBackgroundColor: "#FFCD56",
                            pointRadius: 8,
                            pointHoverRadius: 10,
                            fill: true,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          r: {
                            beginAtZero: true,
                            min: 0,
                            max: 10,
                            ticks: {
                              display: true,
                              stepSize: 2,
                              color: "white",
                            },
                            grid: {
                              color: "white",
                              circular: true,
                            },
                            pointLabels: {
                              color: "white",
                              font: { size: 16 },
                            },
                            angleLines: {
                              color: "white",
                            },
                          },
                        },
                        plugins: {
                          legend: {
                            position: "top",
                            labels: { color: "white", font: { size: 14 } },
                          },
                          tooltip: {
                            backgroundColor: "rgba(40, 40, 40, 0.95)",
                            titleColor: "#ffffff",
                            bodyColor: "#ffffff",
                            borderColor: "#ffffff",
                            borderWidth: 1,
                            cornerRadius: 8,
                            padding: 12,
                            callbacks: {
                              label: function (context) {
                                const metric = selectedMetrics[context.dataIndex];
                                let unit = "";
                                if (metric === "Mass") unit = " tons";
                                else if (metric === "Repair") unit = " credits";
                                else if (metric === "Crew") unit = " persons";
                                else if (metric === "Research") unit = " exp";
                                let rawValue;
                                if (context.datasetIndex === 0) {
                                  rawValue = getMetricValue(vehicle1Details, metric);
                                } else {
                                  rawValue = getMetricValue(vehicle2Details, metric);
                                }
                                const scaledValue = context.parsed.r;
                                return `${context.dataset.label}: ${scaledValue.toFixed(
                                  2
                                )} (raw: ${rawValue.toFixed(2)}${unit})`;
                              },
                            },
                          },
                        },
                      }}
                      style={{ height: "400px" }}
                    />
                  )}
                </div>
                <div className="radar_legend">
                  <div>
                    <div
                      className="legend_color"
                      style={{ backgroundColor: "#FF6384" }}
                    ></div>
                    <span>{vehicle1Details.identifier}</span>
                  </div>
                  <div>
                    <div
                      className="legend_color"
                      style={{ backgroundColor: "#FFCD56" }}
                    ></div>
                    <span>{vehicle2Details.identifier}</span>
                  </div>
                </div>
                {selectedChart === "overall" && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "20px",
                      marginTop: "20px",
                      color: "white",
                    }}
                  >
                    {allMetrics.map((metric) => (
                      <label key={metric}>
                        <input
                          type="checkbox"
                          checked={selectedMetrics.includes(metric)}
                          onChange={() => handleMetricToggle(metric)}
                          className="filter_checkbox"
                        />
                        {metric}
                      </label>
                    ))}
                    <div>
                      <label>
                        <input
                          type="checkbox"
                          checked={useNormalized}
                          onChange={(e) => setUseNormalized(e.target.checked)}
                          className="filter_checkbox"
                        />
                        Use Normalized Values
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="radar_grid_item">
              <div className="placeholder">
                <p>Select two vehicles to see detailed comparison</p>
              </div>
            </div>
          )}
          <div className="card">
            <div className="card_top">
              <div className="nation_filter">
                <label className="form_label">Select Nation:</label>
                <select
                  value={selectedNation2}
                  onChange={(e) => setSelectedNation2(e.target.value)}
                  className="form_select"
                >
                  {nations.map((nation) => (
                    <option key={nation} value={nation}>
                      {nation.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="search_bar">
                <label className="form_label">Search:</label>
                <input
                  type="text"
                  placeholder="Search for a vehicle..."
                  value={searchQuery2}
                  onChange={(e) => setSearchQuery2(e.target.value)}
                  className="form_input"
                />
              </div>
            </div>
            {vehicle2Details ? (
              <VehiclePanel
                vehicle={vehicle2Details}
                vehicles={filteredVehicles2}
                onSelectChange={(e) => setVehicle2(e.target.value)}
                selectedBR={selectedBR}
                isGroundBattle={isGroundBattle}
              />
            ) : (
              <div
                className="vehicle_placeholder"
                onClick={() => setVehicle2(vehicles[1]?.identifier || "")}
              >
                <p>Click to select a vehicle</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className="footer">
        <p>© 2025 ThunderStats. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default ComparisonPage;