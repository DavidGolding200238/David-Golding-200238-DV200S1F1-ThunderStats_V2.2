# ThunderStats: Technical Description

## Application Overview and Functionality
ThunderStats is a React-based web application crafted to deliver detailed analytical insights into War Thunder vehicle data, tailored for players and enthusiasts eager to explore the game’s mechanics. Utilizing React Router for seamless navigation, the application is organized into three distinct pages, each designed with a specific analytical focus:

- **LandingPage (`Landingpage.js`):** This serves as the application’s entry point, presenting an overview of tank type distribution across various nations. It features a custom SVG-based donut chart to visualize categories such as Light, Medium, and Heavy tanks, derived from the `getTankCategory` function. The page is complemented by a navigation bar (`Nav`), a prominent hero section for key content, a tools section for additional analysis options, and a consistent footer (`Footer`) for branding.
- **ComparisonPage (`Comparisonpage.js`):** Designed for comparative analysis, this page enables users to evaluate vehicles based on metrics including speed, mass, cost, and overall specifications. It incorporates a reusable `VehiclePanel` component for vehicle selection, a `Filters` section allowing refinement by nation, type, and Battle Rating (BR), and a `Radar Grid` that displays dynamic Chart.js visualizations (Bar, Pie, Radar). Users can switch between chart types to suit their analysis preferences, with real-time updates driven by their selections.
- **TimelinePage (`Timeline.js`):** Focused on historical trends, this page allows users to track changes in vehicle statistics—such as BR, repair cost, and rank—over time. It leverages the reusable `VehiclePanel` for vehicle selection, includes a `Selection` interface for choosing specific stats, and presents data via a Chart.js Line chart within a `History` section. The page supports a tabbed interface, enabling users to toggle between a graph view and a detailed timeline view for enhanced data exploration.

The application ensures a cohesive user experience through shared components (`Nav`, `Footer`, `VehiclePanel`) and a unified styling approach via `Global.css`, which applies a dark theme with orange accents to reflect a tactical War Thunder aesthetic.

## API Integration
ThunderStats relies on the Unofficial Warthunder API to source vehicle data, with integration managed through the `WarthunderApi.js` utility module. The following details outline the technical implementation:

- **API Endpoints and Functions:**
  - `fetchAllVehiclesPaginated`: Retrieves a paginated list of vehicles, supporting the data needs of `LandingPage` and `ComparisonPage` by efficiently handling large datasets.
  - `fetchVehicleDetails`: Provides detailed vehicle data, including historical statistics, primarily utilized by `TimelinePage` to construct trend analyses.
  - An additional endpoint (`https://www.wtvehiclesapi.sgambe.serv00.net/api/vehicles/stats`) is employed by `TimelinePage` to fetch version options, enabling users to select specific historical data points.
- **Caching Mechanism:** Performance is optimized through a caching system implemented via `vehiclesCache` in `WarthunderApi.js`. This stores API responses, minimizing redundant requests and enhancing load times for frequently accessed data.
- **Error Management:** Basic error handling is integrated into API calls within `useEffect` hooks (e.g., try-catch blocks), logging issues to the console for debugging purposes. However, user-facing error notifications are not currently implemented, relying instead on fallback UI states such as empty vehicle lists.

## Visualization Techniques
ThunderStats employs a blend of custom and Chart.js-based visualizations to present data effectively, with each tailored to its respective page’s analytical focus:

- **CustomDonutChart (LandingPage):** A bespoke SVG-based donut chart displays tank type distribution across nations, with data processed using the `getTankCategory` function to categorize vehicles (e.g., Light, Medium, Heavy). Styled with a tactical font and subtle orange highlights (`#F5A623`), it offers a static visualization that aligns with the app’s aesthetic.
- **Bar, Pie, Radar (ComparisonPage):** These Chart.js visualizations, integrated via the `react-chartjs-2` library, provide dynamic comparisons:
  - **Bar Chart:** Illustrates metrics such as speed or mass across selected vehicles, with data prepared by functions like `getVehicleSpeed` and `getVehicleMass`.
  - **Pie Chart:** Presents proportional data (e.g., cost distribution), dynamically scaled for clarity.
  - **Radar Chart:** Visualizes overall specifications (e.g., speed, mass, armor) for multiple vehicles, with user-selectable metrics (e.g., Research, Repair, Crew, Mass) via checkboxes. The chart adjusts its scale based on the highest value to avoid rendering issues.
  - All charts include hover tooltips and responsive design for an interactive user experience.
- **Line (TimelinePage):** A Chart.js Line chart tracks historical trends in vehicle stats (e.g., BR, repair cost, rank) over time. Data is derived from historical API responses, with version options fetched separately to populate the timeline. The chart supports a tabbed interface (Graph vs. Timeline views), ensuring clear visual differentiation between active tabs.

## Assumptions and Limitations

### Assumptions:
- **API Availability:** The application assumes the Unofficial Warthunder API remains accessible and delivers accurate, current vehicle data, including historical statistics.
- **User Knowledge:** It is assumed that users possess a foundational understanding of War Thunder terminology (e.g., BR, tank types, repair costs) to fully engage with the visualizations.
- **Browser Compatibility:** The app is designed for modern browsers supporting React and Chart.js, with optimal performance on desktop environments.

### Limitations:
- **API Dependency:** Reliance on the Unofficial Warthunder API introduces risks, such as potential disruptions if the API’s structure or availability changes. For instance, modifications to the `/api/vehicles/stats` endpoint could impair `TimelinePage`’s version selection.
- **Data Inconsistencies:** Historical data for some vehicles may be incomplete or missing, potentially resulting in gaps within the Line chart on `TimelinePage`. The app does not currently address these gaps with fallback data or user alerts.
- **Performance Considerations:** Large datasets can lead to initial load delays, particularly for `fetchAllVehiclesPaginated`. While pagination and caching mitigate this, users with slower connections may still experience latency.
- **Visualization Interactivity:** The `CustomDonutChart` on `LandingPage` is static, lacking interactive elements like tooltips or click events available in Chart.js charts, which may limit user engagement.
- **Metric Constraints:** Comparison metrics (e.g., speed, mass, cost) are predefined in `Comparisonpage.js`, restricting users from adding custom metrics without code modifications.
- **Responsive Design Challenges:** The application is optimized for desktop use, with potential rendering issues on mobile devices. For example, the `Radar Grid` on `ComparisonPage` may require horizontal scrolling, and dropdowns/search bars (e.g., `.selection__group .form__input`) may exceed optimal widths without further `max-width` adjustments.
- **Error Feedback:** API errors are logged to the console, but the absence of user-facing error messages (e.g., "Failed to load vehicles") could hinder usability if data retrieval fails.

## Conclusion
ThunderStats provides a robust platform for War Thunder vehicle analysis, integrating custom and Chart.js visualizations within a well-structured React architecture. While it delivers valuable insights, its dependence on an unofficial API and certain design limitations underscore opportunities for future enhancements, such as improved error handling, mobile optimization, and increased visualization interactivity.