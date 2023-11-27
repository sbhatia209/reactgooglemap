import {
  ComponentParams,
  ComponentRendering,
  ImageField,
  RichTextField,
  TextField,
  withDatasourceCheck,
} from '@sitecore-jss/sitecore-jss-nextjs';
import {
  GoogleMap,
  InfoWindowF,
  MarkerF,
  useLoadScript,
} from '@react-google-maps/api';
import { useMemo, useState } from 'react';

import styles from './DemoMap.module.css';

type MapDetailItem = {
  latitude: { jsonValue: TextField };
  longitude: { jsonValue: TextField };
  details: { jsonValue: RichTextField };
};

interface ComponentProps {
  rendering: ComponentRendering;
  params: ComponentParams;
  fields: {
    data: {
      fields: {
        map: {
          targetItems: MapDetailItem[];
        };
      };
    };
  };
}

const DemoMap = (props: ComponentProps): JSX.Element => {
  const mapRangeSt = props.params?.MapRange;
  const [infoWindowData, setInfoWindowData] = useState<
    { index: number; info: MapDetailItem } | undefined
  >();
  const [isOpen, setIsOpen] = useState(false);
  let rangeCenter;
  let zoom = 3.5; // Default to Your Location
  let centerLat = 47.1164; // Default to Your Location
  let centerLong = -101.2996; // Default to Your Location

  // Check the logic if MapRange is set in your datasource then get from there.
  if (mapRangeSt) {
    const MapRangeJson = JSON.parse(mapRangeSt);

    rangeCenter = MapRangeJson?.RangeCenter?.value.split(',');
    zoom = Number(MapRangeJson?.Zoom?.value);
    centerLat = Number(rangeCenter[0]);
    centerLong = Number(rangeCenter[1]);
  }

  const mapCenter = useMemo(
    () => ({ lat: centerLat, lng: centerLong }),
    [centerLat, centerLong]
  );

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: true,
      clickableIcons: false,
      scrollwheel: false,
      zoomControl: true,
      mapTypeControl: true,
      styles: [
        {
          featureType: 'administrative.country',
          elementType: 'geometry.fill',
          stylers: [
            {
              gamma: '0.00',
            },
            {
              weight: '0.01',
            },
            {
              visibility: 'simplified',
            },
            {
              color: '#1b75bc',
            },
          ],
        },
        {
          featureType: 'water',
          elementType: 'all',
          stylers: [
            {
              color: '#FFFFFF',
            },
            {
              visibility: 'on',
            },
          ],
        },
        {
          featureType: 'water',
          elementType: 'geometry.fill',
          stylers: [
            {
              color: '#023459',
            },
          ],
        },
      ],
    }),
    []
  );

  const handleMarkerClick = (index: number, info: MapDetailItem) => {
    setInfoWindowData({ index, info });
    setIsOpen(true);
  };

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: '<your-api-key>',
    libraries: ['places'],
  });

  if (!isLoaded) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div className={styles['location-finder-map-container']}>
        <div className={styles['map']}>
          <GoogleMap
            options={mapOptions}
            zoom={zoom}
            center={mapCenter}
            mapContainerClassName={styles.map}
          >
            {props?.fields?.data?.fields?.map.targetItems.map((info, index) => (
              <MarkerF
                key={index}
                icon={'http://maps.google.com/mapfiles/ms/icons/blue.png'}
                position={{
                  lat: Number(info.latitude.jsonValue.value),
                  lng: Number(info.longitude.jsonValue.value),
                }}
                onClick={() => {
                  handleMarkerClick(index, info);
                }}
              >
                {isOpen && infoWindowData?.index === index && (
                  <>
                    <InfoWindowF
                      position={{
                        lat: Number(info.latitude.jsonValue.value),
                        lng: Number(info.longitude.jsonValue.value),
                      }}
                      onCloseClick={() => {
                        setIsOpen(false);
                      }}
                    >
                      <>
                        <div className="content">
                          // Write Your HTML here to show on the Info Window
                        </div>
                      </>
                    </InfoWindowF>
                  </>
                )}
              </MarkerF>
            ))}
          </GoogleMap>
        </div>
      </div>
    </>
  );
};

export default withDatasourceCheck()<ComponentProps>(DemoMap);
