import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Stack,
  FormControl,
  InputLabel,
  MenuItem,
} from "@mui/material";
import { ReactComponent as Edit } from "../../../assets/icon/edit.svg";
import { ReactComponent as Location } from "../../../assets/icon/location.svg";
import LocationJson from "../../../assets/json/location.json";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import "./Profile.css";


const locationOptions = Object.keys(LocationJson).sort();

const ChangeLocation = () => {
  const [isEditingLocation, setIsEditingLocation] = useState<boolean>(false);
  const [locations, setLocations] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [detailedLocation, setDetailedLocation] = useState<string>("");
  const [defaultLocation, setDefaultLocation] = useState<string>("");
  const [defaultDetailedLocation, setDefaultDetailedLocation] =
    useState<string>("");


  // 상세주소용
  const [detailedLocationOptions, setDetailedLocationOptions] = useState<
    string[]
  >([]);

  const valueRef = useRef(defaultLocation);
  let isMount = useRef(false);
    
  useEffect(() => {
    isMount.current = true;
    getMyLocation();
    return () => {
      if (Object.keys(defaultLocation).length) {
      setDetailedLocationOptions(Object.keys(null || LocationJson[
        valueRef.current as keyof typeof LocationJson
      ]))};
      isMount.current = false;
    };
  }, []);
  

  const getMyLocation = () => {
    const token = localStorage.getItem("token");
    axios({
      method: "get",
      url: "userInfo/myinfo",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      // console.log(res);
      setLocations(res.data.data.memberProfile.location);
      setLocation(res.data.data.memberProfile.location.split(" ")[0]);
      if (res.data.data.memberProfile.location.split(" ")[2]) {
        setDetailedLocation(
          res.data.data.memberProfile.location.split(" ")[1] + ' ' + res.data.data.memberProfile.location.split(" ")[2]
        );
        setDefaultDetailedLocation(
          res.data.data.memberProfile.location.split(" ")[1] + ' ' + res.data.data.memberProfile.location.split(" ")[2]
        );
      }
      else {
        setDetailedLocation(res.data.data.memberProfile.location.split(" ")[1]);
        setDefaultDetailedLocation(
          res.data.data.memberProfile.location.split(" ")[1]
        );
      }
      setDefaultLocation(res.data.data.memberProfile.location.split(" ")[0]);
    })
    .catch((err) => console.log(err));
  }


  const closeEditing = () => {
    setIsEditingLocation(false);
    setLocation(defaultLocation);
    setDetailedLocation(defaultDetailedLocation);
  };

  // 위치 정보 수정
  const locationEditingMode = () => {
    if (!isEditingLocation) {
      return setIsEditingLocation(true);
    }
  };

  // 시/도 부분 수정
  const onChangeLocation = (event: SelectChangeEvent) => {
    setLocation(event.target.value as string);
    setDetailedLocationOptions(
      Object.keys(LocationJson[
        event.target.value as keyof typeof LocationJson
      ]).sort()
    );
  };

  // 시/군/구 부분 수정
  const onChangeDetailedLocation = (event: SelectChangeEvent) => {
    setDetailedLocation(event.target.value as string);
  };

  const changeLocation = () => {
    const token = localStorage.getItem("token");
    axios({
      method: "put",
      url: "userInfo/location",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        location: location + " " + detailedLocation,
        longitude:
          // @ts-ignore
          LocationJson[location][detailedLocation].longitude,
        latitude:
          // @ts-ignore
          LocationJson[location][detailedLocation].latitude,
      },
    })
      .then(() => {
        console.log("위치 정보 수정 완료");
        setIsEditingLocation(false);
        getMyLocation();
      })
      .catch((err) => console.log(err));
  };

  return (
    <>
      <Stack>
        {isEditingLocation ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <Stack>
              <FormControl>
                <InputLabel id="demo-simple-select-label">시/도</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={location}
                  label="시/도"
                  onChange={onChangeLocation}
                  className="select-custom"
                >
                  {locationOptions &&
                    locationOptions.map((option, index) => {
                      return (
                        <MenuItem 
                          key={index} 
                          value={option}
                          sx={{ fontFamily: "S-CoreDream-4Regular" }}
                        >
                          {option}
                        </MenuItem>
                      );
                    })}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">시/군/구</InputLabel>
                <Select
                  id="demo-simple-select"
                  label="시/군/구"
                  // defaultValue={defaultDetailedLocation}
                  value={detailedLocation}
                  onChange={onChangeDetailedLocation}
                  className="select-custom"
                >
                  {detailedLocationOptions && detailedLocationOptions.map((option) => {
                  return (
                    <MenuItem 
                      key={option} 
                      value={option}
                      sx={{ fontFamily: "S-CoreDream-4Regular" }}  
                    >
                      {option}
                    </MenuItem>
                  );
                })}
                </Select>
              </FormControl>
            </Stack>
            <button className="button-custom" onClick={changeLocation}>
              수정
            </button>
            <button className="button-custom" onClick={closeEditing}>
              취소
            </button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={2} alignItems="center">
            <Location className="location-custom"/>
            <p>{locations}</p>
            <Edit onClick={locationEditingMode} className="svg-custom" />
          </Stack>
        )}
      </Stack>
    </>
  );
};

export default ChangeLocation;