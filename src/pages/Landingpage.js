import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Global.css";
import { fetchAllVehiclesPaginated } from "../api/WarthunderApi";

const CustomDonutChart = ({ data }) => {
  if (!data) return null;

  const dataset = data.datasets[0];
  const counts = dataset.data;
  const colors = dataset.backgroundColor;
  const total = counts.reduce((sum, count) => sum + count, 0);

  const radius = 90;
  const center = 120;
  const circumference = 2 * Math.PI * radius;

  // Calculate segments with cumulative offset
  let cumulativeDash = 0;
  const segments = counts.map((count, index) => {
    const percentage = total ? count / total : 0;
    const dash = Math.max(percentage * circumference, 1); 
    const gap = circumference - dash;
    const offset = -cumulativeDash - circumference / 4; // Start at 12 o'clock
    cumulativeDash += dash;
    return {
      dash,
      gap,
      offset,
      color: colors[index],
      label: data.labels[index],
      value: count,
    };
  }).filter(seg => seg.value > 0); 

  return (
    <div className="donut_wrapper">
      <svg viewBox="0 0 240 240" width="300" height="300" className="donut">
        {segments.map((seg, index) => (
          <circle
            key={index}
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={seg.color}
            strokeWidth="30"
            strokeDasharray={`${seg.dash} ${seg.gap}`}
            strokeDashoffset={seg.offset}
          />
        ))}
        <circle
          cx={center}
          cy={center}
          r={radius - 15}
          fill="#2A3439"
          stroke="none"
        />
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dy="0.35em"
          fill="#e0e0e0"
          fontSize="24"
          fontWeight="bold"
          className="donut_total"
        >
          {total}
        </text>
      </svg>
      <div className="donut_legend">
        {segments.map((seg, index) => (
          <div key={index} className="legend_item">
            <div
              className="legend_color"
              style={{ backgroundColor: seg.color }}
            ></div>
            <span>
              {seg.label}: {seg.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getTankCategory = (vehicleType) => {
    if (!vehicleType) return null;
    const type = vehicleType.toLowerCase();
    if (type.includes("spaa")) return "SPAA";
    if (type.includes("light")) return "Light";
    if (type.includes("medium")) return "Medium";
    if (type.includes("tank destroyer") || type.includes("tank_destroyer"))
      return "Tank Destroyer";
    if (type.includes("heavy")) return "Heavy";
    return null;
  };

  useEffect(() => {
    async function loadVehicles() {
      try {
        const vehicles = await fetchAllVehiclesPaginated();
        const tankVehicles = vehicles.filter(
          (v) => getTankCategory(v.vehicle_type) !== null
        );
        let counts = {
          Light: 0,
          Medium: 0,
          "Tank Destroyer": 0,
          SPAA: 0,
          Heavy: 0,
        };

        tankVehicles.forEach((v) => {
          const cat = getTankCategory(v.vehicle_type);
          if (cat && counts.hasOwnProperty(cat)) {
            counts[cat] += 1;
          }
        });

        const dynamicData = {
          labels: ["Light", "Medium", "Tank Destroyer", "SPAA", "Heavy"],
          datasets: [
            {
              label: "Tank Distribution",
              data: [
                counts["Light"],
                counts["Medium"],
                counts["Tank Destroyer"],
                counts["SPAA"],
                counts["Heavy"],
              ],
              backgroundColor: [
                "#F5A623",
                "#D32F2F",
                "#7CB342",
                "#4B6173",
                "#9C27B0",
              ],
            },
          ],
        };

        setChartData(dynamicData);
      } catch (error) {
        console.error("Error loading vehicles:", error);
      } finally {
        setLoading(false);
      }
    }

    loadVehicles();
  }, []);

  return (
    <div className="landing">
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
      <section className="hero">
        <div className="hero_content">
          <h1>
            <span className="hero_highlight">Compare</span> War Thunder Vehicles
          </h1>
          <p>
            Detailed analysis and historical data for all your favorite tanks,
            aircraft, and ships.
          </p>
        </div>
        <div className="card">
          <h3>Tank Type Distribution</h3>
          <div className="chart">
            {loading ? (
              <p>Loading chart data...</p>
            ) : chartData ? (
              <CustomDonutChart data={chartData} />
            ) : (
              <p>No data available</p>
            )}
          </div>
        </div>
      </section>
      <section className="tools">
        <h2>
          <span className="hero_highlight">Complete</span> Analysis Tools
        </h2>
        <div className="tools_grid">
          <div className="card">
            <div className="tool_icon"></div>
            <h3>Side-by-Side Comparison</h3>
            <p>
              Compare any two vehicles with detailed stat breakdowns and visual
              charts to see which performs better.
            </p>
          </div>
          <div className="card">
            <div className="tool_icon"></div>
            <h3>Historical Changes</h3>
            <p>
              Track how vehicles have been buffed or nerfed through War Thunder's
              update history.
            </p>
          </div>
          <div className="card">
            <div className="tool_icon"></div>
            <h3>Detailed Statistics</h3>
            <p>
              Access comprehensive specifications for firepower, mobility, armor
              protection, and utility.
            </p>
          </div>
        </div>
      </section>
      <footer className="footer">
        <p>© 2025 ThunderStats. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;