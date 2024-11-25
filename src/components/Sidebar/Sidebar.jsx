import { useState, useEffect } from 'react';
import { IconButton, Slide, Box, Button } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIos';
import './Sidebar.css';

const Sidebar = () => {
  const [openSideBox, setOpenSideBox] = useState(false);
  const [totalFields, setTotalFields] = useState(0);
  const [totalArea, setTotalArea] = useState(0);

  const onSideboxOpen = () => setOpenSideBox(true);
  const onSideboxClose = () => setOpenSideBox(false);

  useEffect(() => {
    const fetchGeoJsonData = async () => {
      try {
        const response = await fetch('/Indonesia_oil_palm_concessions.geojson');
        if (!response.ok) {
          throw new Error(`Failed to fetch GeoJSON: ${response.statusText}`);
        }

        const geoJson = await response.json();

        const totalFields = geoJson.features.length;
        const totalArea = geoJson.features.reduce((sum, feature) => {
          const area = feature.properties.area_ha || 0;
          return sum + area;
        }, 0);

        setTotalFields(totalFields);
        setTotalArea(totalArea.toFixed(3));
      } catch (error) {
        console.error('Error fetching GeoJSON data:', error);
      }
    };

    fetchGeoJsonData();
  }, []);

  const handleDownloadCSV = () => {
    const link = document.createElement('a');
    link.href = '/Indonesia_oil_palm_concessions.csv';
    link.download = 'Indonesia_oil_palm_concessions.csv';
    link.click();
  };

  return (
    <div className={`sidebar ${openSideBox ? 'open' : 'collapsed'}`}>
      <IconButton
        aria-label="Open Sidebar"
        onClick={onSideboxOpen}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 0,
          borderRadius: '50%',
          backgroundColor: 'black',
          position: 'absolute',
          top: '5%',
          transform: 'translateY(-50%)',
          zIndex: 400,
          color: '#f2f2f2',
          width: '40px',
          height: '40px',
        }}
      >
        <ArrowBackIosNewIcon fontSize="small" />
      </IconButton>

      <Slide direction="left" in={openSideBox} mountOnEnter unmountOnExit>
        <Box
          component="div"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: '350px',
            p: 1,
            borderRadius: '15px',
            position: 'relative',
            height: '100%',
            zIndex: 1000,
            color: '#f2f2f2',
            background: 'linear-gradient(-90deg, rgba(5,60,58,1) 35%, rgba(18,18,18,1) 100%)',
          }}
        >
          <div className="sidebar-header">
            <IconButton
              aria-label="Close Sidebar"
              onClick={onSideboxClose}
              sx={{
                p: 1,
                border: '1px solid grey',
                borderRadius: '12px',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                alignSelf: 'flex-start',
                marginBottom: '5px',
                position: 'absolute',
                top: '10px',
                left: '10px',
                color: '#f2f2f2',
                width: 40,
              }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
            <h2 className="heading-3d">Summary</h2>
          </div>
          <div className="sidebar-content">
            <div className="info-box-container">
              <div
                className="info-box"
                style={{ backgroundColor: 'rgba(242, 242, 242, 0.16)', borderColor: '#14DFAF' }}
              >
                <p className="info-title">Total Fields</p>
                <p className="info-value">{totalFields}</p>
              </div>
              <div
                className="info-box"
                style={{ backgroundColor: 'rgba(242, 242, 242, 0.16)', borderColor: '#14DFAF' }}
              >
                <p className="info-title">Total Area (in Ha)</p>
                <p className="info-value">{totalArea}</p>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '20px',
                flexDirection: 'column',
                width: '100%',
              }}
            >
              <h1 className="text-center h-8 font-semibold" style={{ marginBottom: '20px' }}>
                Download the CSV Data of Indonesia
              </h1>
              <Button
                onClick={handleDownloadCSV}
                sx={{
                  backgroundColor: '#14DFAF',
                  color: '#fff',
                  borderRadius: '12px',
                  fontSize: '16px',
                  padding: '10px 20px',
                  '&:hover': {
                    backgroundColor: '#12C39A',
                    color: '#fff',
                  },
                }}
              >
                Download CSV
              </Button>
            </div>
          </div>
        </Box>
      </Slide>
    </div>
  );
};

export default Sidebar;
