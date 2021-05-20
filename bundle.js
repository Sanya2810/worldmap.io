(function (React$1, ReactDOM, d3, topojson) {
  'use strict';

  var React$1__default = 'default' in React$1 ? React$1['default'] : React$1;
  ReactDOM = ReactDOM && Object.prototype.hasOwnProperty.call(ReactDOM, 'default') ? ReactDOM['default'] : ReactDOM;

  const jsonUrl = 'https://unpkg.com/world-atlas@2.0.2/countries-50m.json';

  const useWorldAtlas = () => {
    const [data, setData] = React$1.useState(null);

    React$1.useEffect(() => {
      d3.json(jsonUrl).then(topology => {
        const { countries, land } = topology.objects;
        setData({
          land: topojson.feature(topology, land),
          interiors: topojson.mesh(topology, countries, (a, b) => a !== b)
        });
      });
    }, []);

    return data;
  };

  const csvUrl ='world_map_data.csv';

  const row = (d) => {
    d.lat = +d.latitude;
    d.lng = +d.longitude;
    d.nincidents = +d.n_incidents;
    return d;
  };

  const useCities = () => {
    const [data, setData] = React$1.useState(null);

    React$1.useEffect(() => {
      d3.csv(csvUrl, row).then((data) =>
        setData(data.sort((a, b) => d3.descending(a.latitude, b.latitude)))
      );
    }, []);

    return data;
  };


  const projection = d3.geoNaturalEarth1();
  const path = d3.geoPath(projection);
  
  const mountainWidth = 5;

  const Marks = ({
    worldAtlas: { land, interiors },
    cities,
    heightScale,
    heightValue,
    colorScale,
    colorValue,
  }) => (
    React.createElement( 'g', { className: "marks" },
      React.createElement( 'path', { className: "sphere", d: path({ type: 'Sphere' }) }),
      land.features.map((feature) => (
        React.createElement( 'path', { className: "land", d: path(feature) })
      )),
      React.createElement( 'path', { className: "interiors", d: path(interiors) }),
      React.createElement( 'g', { class: "mountains" },
        cities.map((d) => {
          const [x, y] = projection([d.longitude, d.latitude]);
          const mountainHeight = heightScale(heightValue(d))/20;
          const x1 = x - mountainWidth / 2;
          const x2 = x;
          const x3 = x + mountainWidth / 2;
          const y1 = y;
          const y2 = y - mountainHeight;
          const y3 = y;
          return (
            React.createElement( 'path', { d: `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3}`, title: "test", fill: colorScale(colorValue(d)) },
              React.createElement( 'title', null,
                d.City, ", ", d.Country, ": ",  d.n_incidents, ' '
              )
            )
          );
        })
      )
    )
  );

  const width = 960;
  const height = 1000;

  const heightValue = (d) => d.n_incidents;
  const maxHeight = 120;

  const colorValue = d => d.Country;

  const App = () => {
    const worldAtlas = useWorldAtlas();
    const cities = useCities();

    if (!worldAtlas || !cities) {
      return React$1__default.createElement( 'pre', null, "Loading..." );
    }

    const heightScale = d3.scaleLinear()
      .domain([0, d3.max(cities, heightValue)])
      .range([0, maxHeight]);

    const colorScale = d3.scaleOrdinal().domain(cities.map(colorValue));
    const colorValues = colorScale.domain(); // removes duplicates
    colorScale.range(
      colorValues.map((value, i) => d3.hcl((i / colorValues.length) * 360, 50, 70))
    );

    return (
      React$1__default.createElement( 'svg', { width: width, height: height },
        React$1__default.createElement( Marks, {
          worldAtlas: worldAtlas, cities: cities, heightScale: heightScale, heightValue: heightValue, colorScale: colorScale, colorValue: colorValue })
      )
    );
  };
  const rootElement = document.getElementById('root');
  ReactDOM.render(React$1__default.createElement( App, null ), rootElement);

}(React, ReactDOM, d3, topojson));
