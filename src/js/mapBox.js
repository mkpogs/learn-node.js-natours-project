export const displayMap = (locations) => {
    
    mapboxgl.accessToken = 'pk.eyJ1IjoibWt1cHoiLCJhIjoiY205M2llNGQyMGt5YzJrcjRicW5sOXRtdiJ9.Zx2OLJDUl98oO02vKecXTg';

    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mkupz/cm93ik7zz003701ridwjzhghz',
        scrollZoom: false
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        // CReate Marker
        const el = document.createElement('div');
        el.className = 'marker';
        // Add Marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        })
            .setLngLat(loc.coordinates)
            .addTo(map);

        // Add popup
        new mapboxgl.Popup({
            offset: 30
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map);

        // Extends map bounds to include the current location
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
}