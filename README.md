# ThunderStats

## Overview

ThunderStats is a React-based data visualization web application that leverages the Unofficial Warthunder API to provide in-depth analytics for War Thunder vehicles. The project focuses on presenting clear, actionable insights about tank statistics, comparisons, and historical trends through a tactical, military-inspired design.ThunderStats offers an engaging and intuitive user experience for War Thunder enthusiasts seeking to explore vehicle data in a visually compelling way.

## My Approach

### Development Steps:
- Conducted initial experiments with the Unofficial Warthunder API in separate test projects to understand data fetching, focusing on ground vehicle statistics and historical data.
- Researched other War Thunder API-based projects to identify best practices and refine project planning, ensuring a focus on tank-specific analytics.
- Developed wireframes to define the application’s structure, emphasizing a clean layout with three main pages: Landing, Comparison, and Timeline.
- Reused and adapted code from initial experiments, integrating it into the main application while prioritizing modularity (e.g., reusable VehiclePanel component).
- Enhanced API data accuracy by implementing pagination and caching (vehiclesCache in WarthunderApi.js) to handle large datasets efficiently.
- Explored visual design enhancements, such as a dark tactical theme with orange accents (#F5A623), using tools like ChatGPT to refine styling ideas.
- Iteratively adjusted layouts to align with wireframes, ensuring consistency across pages through a centralized Global.css stylesheet.

### Final Development Notes:
- Finalized a cohesive dark theme with orange highlights across all pages, using a tactical font and subtle glow effects for visual appeal.
- Completed the Timeline page (Timeline.js) with a Chart.js Line chart, supporting historical stat tracking (BR, repair cost, rank) with a tabbed interface (Graph vs. Timeline views).
- Resolved scaling issues with the Radar chart on the Comparison page (Comparisonpage.js), ensuring dynamic adjustments based on the largest value.
- Implemented robust filtering logic for nations, vehicle types, and BR, accessible via dropdowns and search bars.
- Implemented reliable filtering logic for all nations and vehicle types.
- Improved the search function to be more lenient and user-friendly.
- Improved search functionality in VehiclePanel to be more user-friendly, supporting lenient queries for vehicle selection.
- Ensured the Timeline chart displays historical data accurately, despite limited patch/version availability from the API, using a schema file from the API’s GitHub to guide implementation.
- Built the Landing page chart (CustomDonutChart) as a custom SVG visualization, as required by the project brief, focusing on tank type distribution.
- Attempted responsive design, with partial success—desktop optimization is prioritized, but mobile layouts need further refinement.
- Connected all pages via React Router, accessible through a shared Nav component with NavLink for seamless navigation.
- Adjusted the color scheme to balance clarity and aesthetics, ensuring readability across charts and UI elements.
- Utilized ChatGPT to better understand timeline data structures due to poor schema documentation, ensuring accurate historical stat mapping.
- Implemented pagination in WarthunderApi.js (fetchAllVehiclesPaginated) to retrieve the full vehicle dataset, overcoming the API’s default 200-vehicle limit.


## Key Features

- Fetches real-time tank data using the Unofficial Warthunder API, with pagination and caching for performance.
- Filters and displays tank information for easy comparison and readability, supporting nations, vehicle types, and BR ranges.
- Comparison page (`Comparisonpage.js`) enables direct evaluation of two tanks across metrics like speed, mass, and cost, with:
  - **Bar Chart:** Compares individual metrics (e.g., speed, mass).
  - **Pie Chart:** Shows proportional data (e.g., cost distribution).
  - **Radar Chart:** Visualizes overall specs (e.g., speed, mass, armor) with user-selectable metrics (Research, Repair, Crew, Mass).
- Timeline page (`Timeline.js`) tracks vehicle stat progression across game updates, including:
  - Battle Rating (BR) changes.
  - Repair cost adjustments.
  - Rank updates over time, displayed via a Chart.js Line chart with tabbed views.
- Landing page (`Landingpage.js`) features a custom SVG-based `CustomDonutChart` showing tank type distribution (e.g., Light, Medium, Heavy) across nations.
- Military-inspired UI with a dark theme, orange accents, and tactical styling for an immersive experience.
- Reusable components (`Nav`, `Footer`, `VehiclePanel`) ensure consistency across pages.
- Basic responsive layout implemented, with desktop optimization prioritized.
- Enhanced filter logic supports multiple nations, tank types, and BR filtering.
- API pagination ensures access to the full vehicle dataset beyond the default 200-vehicle limit.

## Future Plans

- Redesign the layout to support more advanced filtering options, such as custom metric selection and multi-level filters.
- Expand the comparison page to allow evaluation of more than two tanks simultaneously, with scalable chart visualizations.
- Add a modification overview section for tanks, detailing unlockable modules and upgrades, requiring API enhancements and UI redesign.
- Achieve full responsiveness across devices with an adaptive layout and component structure, addressing current mobile rendering issues.
- Integrate additional tank statistics (e.g., armor thickness, penetration values) and sorting controls for greater user flexibility.
- Include role tags (e.g., tank destroyer, support) for better classification and filtering of vehicles.
- Explore options for saving and exporting comparison results as downloadable reports.
- Consider implementing localization to support multiple languages, broadening accessibility.

## Key Notes

- The Unofficial Warthunder API has strict data access rules, potentially excluding hidden or event-exclusive tanks from the dataset.
- The timeline feature is constrained by limited patch/version data from the API. Historical changes (BR, repair cost, rank) are only visible for select tanks with available data.
- Modification and unlockable data for tanks (e.g., upgrades, modules) is not currently supported by the API, limiting the ability to display such details without significant redesign.
- Extensive retrieval of additional tank statistics (e.g., detailed performance metrics) was not implemented due to the project’s scale and API constraints, necessitating future API enhancements or alternative data sources.
- A potential redesign of the data model and UI would be required to incorporate modification tracking and expanded stats, addressing the complexity of War Thunder’s vehicle data.





## Installation and Setup

### Clone the repository:
```sh
git clone <https://github.com/DavidGolding200238/David-Golding-200238-DV200S1F1-ThunderStats.git>
```

### Move into the project folder:
```sh
cd David-Golding-200238-DV200S1F1-ThunderStats

```

### Install dependencies:
```sh
npm install
```

### Start the app:
```sh
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000).

## Dependencies
- React
- Axios (API fetching)
- Chart.js (data visualization)
- Additional dependencies listed in `package.json`

## Screenshots

![Landing Page](<Screenshots/Landing Page.png>)

![Speed Chart](<Screenshots/Speed Chart.png>)

![Mass Chart](<Screenshots/Mass Chart.png>)

![Cost Chart](<Screenshots/Cost chart.png>)

![Radar Chart](<Screenshots/Radar Chart.png>)

![Time Line Battle Rating](<Screenshots/Time line Graph.png>)

![Time Line repair costs](<Screenshots/Timeline Overview.png>)



## Author
**200238_David Golding**  