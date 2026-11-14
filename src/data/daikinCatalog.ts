export const HERO_CHILLER_IMAGE = '/src/assets/images/hero_daikin_chiller_plant_1794577074906.jpg';
export const THUMB_AIR_CHILLER = '/src/assets/images/thumb_air_cooled_chiller_1794577076537.jpg';
export const THUMB_VRV_SYSTEM = '/src/assets/images/thumb_vrv_system_1794577078308.jpg';
export const THUMB_AHU_UNIT = '/src/assets/images/thumb_ahu_fahu_unit_1794577079136.jpg';

export interface EquipmentCategory {
  id: string;
  index: string;
  name: string;
  shortName: string;
  models: string[];
  controllerTypes: string[];
  primaryManualCode: string;
  image: string;
  summary: string;
  tracks: {
    beginner: {
      title: string;
      duration: string;
      topics: string[];
    };
    intermediate: {
      title: string;
      duration: string;
      topics: string[];
    };
    advanced: {
      title: string;
      duration: string;
      topics: string[];
    };
  };
}

export const EQUIPMENT_CATEGORIES: EquipmentCategory[] = [
  {
    id: 'air-cooled-chillers',
    index: '01',
    name: 'Daikin Air-Cooled Chillers',
    shortName: 'Air-Cooled Chillers',
    models: ['EWAD-TZ-B', 'EWAD-C-SS', 'EWAQ-F-XS'],
    controllerTypes: ['MicroTech III', 'MicroTech IV'],
    primaryManualCode: 'D-EIMAC01405-21_04EN',
    image: THUMB_AIR_CHILLER,
    summary:
      'Single-screw inverter and scroll air-cooled liquid chillers with MicroTech controller architecture, V-bank microchannel coils, and hydronic evaporator protection.',
    tracks: {
      beginner: {
        title: 'Air-Cooled Chiller Architecture & Nameplate Verification',
        duration: '2h 15m',
        topics: [
          'Refrigeration circuit identification (economizer, single-screw compressor, EXV)',
          'Submittal vs nameplate model decoding (EWAD-TZ-B series)',
          'Site airflow clearance & acoustic placement fundamentals',
        ],
      },
      intermediate: {
        title: 'Hydronic Piping, Flow Switches & Electrical Integration',
        duration: '3h 40m',
        topics: [
          'Victaulic evaporator connections, mesh strainer sizing, and paddle/calorimetric flow switch wiring',
          'Anti-vibration spring mount placement per General Arrangement (GA) weight distribution',
          'Phase sequence, voltage imbalance (<2%), and customer interlock terminals',
        ],
      },
      advanced: {
        title: 'MicroTech IV Commissioning, VFD Tuning & Part-Load Diagnostics',
        duration: '4h 30m',
        topics: [
          'Inverter single-screw capacity slide & VFD ramp-up verification',
          'Evaporator approach temperature & subcooling/superheat analysis',
          'BACnet MS/TP & IP point mapping and pump lead/lag sequencing',
        ],
      },
    },
  },
  {
    id: 'water-cooled-chillers',
    index: '02',
    name: 'Daikin Water-Cooled Chillers',
    shortName: 'Water-Cooled Chillers',
    models: ['EWWD-VZ', 'EWWD-J-SS', 'WME-C'],
    controllerTypes: ['MicroTech III', 'MicroTech IV', 'WME Controller'],
    primaryManualCode: 'D-EIMWC01203-19_02EN',
    image: HERO_CHILLER_IMAGE,
    summary:
      'Water-cooled single-screw inverter and magnetic-bearing centrifugal chillers for central district cooling and high-efficiency plant rooms.',
    tracks: {
      beginner: {
        title: 'Shell-and-Tube Heat Exchangers & Condenser Water Loops',
        duration: '2h 00m',
        topics: [
          'Flooded evaporator vs DX evaporator construction',
          'Cooling tower condenser water loop components and head pressure control',
          'Plantroom ventilation and refrigerant leak detection requirements (EN 378 / ASHRAE 15)',
        ],
      },
      intermediate: {
        title: 'Vessel Alignment, Tube Fouling Prevention & Relief Piping',
        duration: '3h 20m',
        topics: [
          'Dual pressure relief valve discharge piping to safe outdoor atmosphere',
          'Evaporator and condenser differential pressure transmitters & flow proofing',
          'Water chemistry limits (pH, conductivity, Langelier Saturation Index)',
        ],
      },
      advanced: {
        title: 'Condenser Approach Optimization & Surge/Slide Valve Diagnostics',
        duration: '4h 45m',
        topics: [
          'Condenser tube fouling diagnosis via condenser approach temperature rise',
          'Inverter VFD refrigerant cooling loop verification on EWWD-VZ',
          'Magnetic bearing levitation & oil-free startup checks (WME-C series)',
        ],
      },
    },
  },
  {
    id: 'ahus',
    index: '03',
    name: 'Daikin AHUs (Air Handling Units)',
    shortName: 'AHUs',
    models: ['DAM-AHU-040', 'D-AHU-PRO-065', 'D-AHU-MOD-030'],
    controllerTypes: ['Daikin Polidoro / Carel c.pCO', 'MicroTech AHU'],
    primaryManualCode: 'D-EIMAH00108-22_01EN',
    image: THUMB_AHU_UNIT,
    summary:
      'Modular double-skin air handling units with EC plug fan arrays, multi-stage filtration, chilled/hot water coils, and damper actuators.',
    tracks: {
      beginner: {
        title: 'AHU Section Identification & Casing Assembly',
        duration: '1h 50m',
        topics: [
          'Mixing box, G4/F7/F9 filter banks, cooling/heating coil, and supply fan sections',
          'Sectional gasket sealing, lifting lugs, and baseframe leveling tolerances',
          'Condensate drain U-trap calculation for negative vs positive pressure plenums',
        ],
      },
      intermediate: {
        title: 'CHW Coil Piping, PICV Balancing & EC Fan Wiring',
        duration: '3h 10m',
        topics: [
          'Counter-flow chilled water coil connections, air vents, and drain valves',
          'Pressure Independent Control Valve (PICV) actuator calibration (0–10V)',
          'Differential pressure switches across filter banks and fan airflow proving',
        ],
      },
      advanced: {
        title: 'TAB (Testing, Adjusting & Balancing) & Static Pressure Reset',
        duration: '3h 50m',
        topics: [
          'Duct static pressure setpoint optimization with VAV terminal units',
          'Psychrometric coil performance verification (DB/WB entering vs leaving)',
          'Fire/smoke damper hardware interlocks and emergency shutdown testing',
        ],
      },
    },
  },
  {
    id: 'fahus',
    index: '04',
    name: 'Daikin FAHUs (Fresh Air Handling Units)',
    shortName: 'FAHUs',
    models: ['DPS-FAHU-100', 'DAM-FAHU-HRW-080'],
    controllerTypes: ['Carel c.pCO Enthalpy Controller', 'MicroTech AHU'],
    primaryManualCode: 'D-EIMFA00211-23_01EN',
    image: THUMB_AHU_UNIT,
    summary:
      '100% outdoor fresh air handling units featuring sorption/sensible rotary heat recovery wheels, run-around coils, and high-latent dehumidification.',
    tracks: {
      beginner: {
        title: '100% Outdoor Air Psychrometrics & Energy Recovery Fundamentals',
        duration: '2h 10m',
        topics: [
          'Sensible vs total enthalpy rotary heat wheel operation',
          'Outdoor air intake sand-trap louvers, bird screens, and pre-filters',
          'Cross-contamination purge sector alignment and airflow direction',
        ],
      },
      intermediate: {
        title: 'Heat Wheel Drive Alignment, Brush Seals & Dehumidification Coils',
        duration: '3h 15m',
        topics: [
          'Rotary wheel belt tension, rotation sensor, and VFD purge control',
          'Deep-row chilled water coil condensate trapping for high ambient humidity',
          'Supply air reheat control (electric / hot water / heat recovery)',
        ],
      },
      advanced: {
        title: 'Enthalpy Wheel Efficiency Verification & Vibration Diagnostics',
        duration: '4h 00m',
        topics: [
          'Calculating sensible and latent recovery effectiveness per EN 308',
          'Diagnosing abnormal FAHU vibration: fan impeller imbalance, shipping bolts, and wheel bearing wear',
          'Demand-controlled ventilation (CO2/VOC) BMS integration',
        ],
      },
    },
  },
  {
    id: 'fcus',
    index: '05',
    name: 'Daikin FCUs (Fan Coil Units)',
    shortName: 'Fan Coil Units',
    models: ['FWV08DAT', 'FWC06BT', 'FWD12AT'],
    controllerTypes: ['BRC315D7', 'FWEC3A', 'Modbus Room Thermostat'],
    primaryManualCode: 'D-EIMFC00412-20_03EN',
    image: THUMB_VRV_SYSTEM,
    summary:
      '2-pipe and 4-pipe hydronic fan coil units (concealed ducted, 4-way cassette, and floor-mounted) with BLDC inverter fan motors.',
    tracks: {
      beginner: {
        title: '2-Pipe vs 4-Pipe Hydronic FCU Selection & Mounting',
        duration: '1h 30m',
        topics: [
          'Threaded rod suspension leveling and ceiling service access hatch dimensions',
          'Return air plenum acoustic insulation and canvas flexible duct connection',
          'Primary condensate drain slope (min 1:100) and auxiliary drain pan float switch',
        ],
      },
      intermediate: {
        title: 'FCU Valve Packages, Flushing Bypass & Thermostat Wiring',
        duration: '2h 20m',
        topics: [
          'Installing 2-way/3-way motorized valves, DRV/PICV, strainer, and flushing bypass loop',
          'Air bleeding at coil manual air vent during hydronic filling',
          'BLDC motor 0–10V speed control and condensate pump safety cut-out',
        ],
      },
      advanced: {
        title: 'Hydronic Delta-T Syndrome & Group BMS Addressing',
        duration: '2h 50m',
        topics: [
          'Diagnosing low chilled-water Delta-T across large FCU zones',
          'Modbus RTU daisy-chain termination and addressing on FWECSA controllers',
          'Acoustic NC rating verification and static pressure external adjustment',
        ],
      },
    },
  },
  {
    id: 'vrv-vrf-systems',
    index: '06',
    name: 'Daikin VRV / VRF Systems',
    shortName: 'VRV / VRF Systems',
    models: ['REYQ16T', 'RXYQ18T', 'FXFQ100A', 'BSVQ100PV1'],
    controllerTypes: ['BRC1E53A', 'intelligent Touch Manager (iTM)', 'DIII-Net'],
    primaryManualCode: 'D-EIMVRV0418-21_05EN',
    image: THUMB_VRV_SYSTEM,
    summary:
      'Variable Refrigerant Volume (VRV IV / V) heat pump and heat recovery systems with REFNET joints, Branch Selector (BS) boxes, and Variable Refrigerant Temperature (VRT).',
    tracks: {
      beginner: {
        title: 'VRV Architecture, REFNET Piping Rules & Nitrogen Brazing',
        duration: '2h 45m',
        topics: [
          'Heat Pump (2-pipe) vs Heat Recovery (3-pipe with BS box) system layout',
          'REFNET header and joint horizontal installation tolerances (±15° max)',
          'Oxygen-free dry nitrogen purge during copper brazing (0.02 MPa flow)',
        ],
      },
      intermediate: {
        title: '3-Stage Pressure Testing, Triple Evacuation & Additional Charge',
        duration: '3h 50m',
        topics: [
          'Step-up nitrogen pressure test up to design pressure (4.0 MPa for R-410A / R-32 per IOM)',
          'Deep vacuum evacuation below 500 microns (-100.7 kPa) and standing vacuum hold test',
          'Calculating additional refrigerant charge by liquid pipe length diameters and weighing in via service port',
        ],
      },
      advanced: {
        title: 'DIII-Net Field Settings, Test Run & Inverter Error Diagnostics',
        duration: '4h 40m',
        topics: [
          'F1-F2 polarity-free shielded twisted-pair DIII-Net bus topology and Q1-Q2 outdoor link',
          '7-segment display Mode 1 / Mode 2 field settings and automated test-run sequence',
          'Troubleshooting U0, U2, U4, E3, L5, and PJ codes with inverter checker module',
        ],
      },
    },
  },
  {
    id: 'dx-systems',
    index: '07',
    name: 'Daikin DX Systems',
    shortName: 'DX Systems',
    models: ['FDMQ125RV1', 'RZASG125MV1', 'FDMRN100A'],
    controllerTypes: ['BRC1H52W', 'Madoka Wired Controller'],
    primaryManualCode: 'D-EIMDX00309-21_02EN',
    image: THUMB_VRV_SYSTEM,
    summary:
      'Direct Expansion split and SkyAir commercial systems for medium-static and high-static ducted applications.',
    tracks: {
      beginner: {
        title: 'DX Split & SkyAir Refrigerant Line Sizing & Flare Connections',
        duration: '1h 45m',
        topics: [
          'Maximum equivalent pipe length and vertical elevation limits',
          'Torque wrench flare nut tightening specifications and oil trap requirements',
          'Outdoor condensing unit mounting pad drainage and snow/wind baffling',
        ],
      },
      intermediate: {
        title: 'External Static Pressure (ESP) Auto-Adjustment & Condensate Lift',
        duration: '2h 30m',
        topics: [
          'Configuring indoor fan ESP via BRC1H52W field settings to match ductwork curve',
          'High-lift drain pump check valve orientation and float switch testing',
          'Inter-unit power and communication cable separation from high-voltage feeders',
        ],
      },
      advanced: {
        title: 'Superheat / Subcooling Verification & Expansion Valve Diagnostics',
        duration: '3h 15m',
        topics: [
          'Measuring suction superheat and liquid subcooling under stabilized load',
          'Electronic Expansion Valve (EV) coil resistance test (150–500 Ohm per winding)',
          'Thermistor resistance-temperature curve verification (R25 = 20 kOhm)',
        ],
      },
    },
  },
  {
    id: 'packaged-units',
    index: '08',
    name: 'Daikin Packaged Units',
    shortName: 'Packaged Units',
    models: ['UATYQ120FC', 'UAT-K090'],
    controllerTypes: ['Daikin Packaged Microprocessor', 'BRC230Z'],
    primaryManualCode: 'D-EIMPK00514-20_01EN',
    image: THUMB_AIR_CHILLER,
    summary:
      'Self-contained commercial packaged air conditioners with scroll compressors, factory-charged refrigerant circuits, and supply/return duct connections.',
    tracks: {
      beginner: {
        title: 'Packaged Unit Rigging, Curb Mounting & Duct Transitions',
        duration: '1h 40m',
        topics: [
          'Spreader bar rigging requirements to protect condenser coil fins',
          'Neoprene vibration isolation pads and roof curb weatherproofing',
          'Supply and return duct canvas flexible connectors',
        ],
      },
      intermediate: {
        title: 'Belt-Drive / Direct-Drive Blower Setup & Economizer Damper',
        duration: '2h 35m',
        topics: [
          'Variable-pitch motor pulley adjustment and V-belt tension deflection measurement',
          'Motor full-load amp (FLA) verification against nameplate rating',
          'Fresh air economizer enthalpy damper calibration',
        ],
      },
      advanced: {
        title: 'Dual-Circuit Scroll Staging & Low-Ambient Head Pressure Control',
        duration: '3h 10m',
        topics: [
          'Lead/lag compressor staging and crankcase heater pre-heat verification',
          'High-pressure and low-pressure safety switch cut-out verification',
          'Smoke detector supply/return duct shutdown interlock testing',
        ],
      },
    },
  },
  {
    id: 'heat-pumps',
    index: '09',
    name: 'Daikin Heat Pumps',
    shortName: 'Heat Pumps',
    models: ['EWYT-B-SS', 'ERLQ016CV3', 'EWYQ-B-XR'],
    controllerTypes: ['MicroTech IV Heat Pump', 'Altherma Hydrobox Controller'],
    primaryManualCode: 'D-EIMHP00902-22_02EN',
    image: THUMB_AIR_CHILLER,
    summary:
      'Reversible air-to-water heat pumps and four-pipe simultaneous heating/cooling units using R-32 and inverter scroll/screw technology.',
    tracks: {
      beginner: {
        title: 'Reversible Heat Pump Cycle, 4-Way Valve & Defrost Management',
        duration: '2h 00m',
        topics: [
          '4-way reversing valve operation in cooling vs heating modes',
          'Basepan condensate drainage during winter defrost cycles and trace heating',
          'R-32 A2L mildly flammable refrigerant safety precautions and leak clearances',
        ],
      },
      intermediate: {
        title: 'Buffer Tank Sizing, Glycol Freeze Protection & DHW Integration',
        duration: '3h 00m',
        topics: [
          'Minimum system water volume calculation to prevent short-cycling during defrost',
          'Ethylene/propylene glycol concentration refractometer testing',
          '3-way diverting valve wiring for Domestic Hot Water (DHW) priority',
        ],
      },
      advanced: {
        title: 'Weather-Compensated Leaving Water Curve & Bivalent Control',
        duration: '3h 40m',
        topics: [
          'Configuring climatic heating curves based on outdoor ambient temperature',
          'Bivalent auxiliary boiler interlock and COP optimization',
          'A2L refrigerant recovery and evacuation with spark-free certified tools',
        ],
      },
    },
  },
  {
    id: 'rooftop-units',
    index: '10',
    name: 'Daikin Rooftop Units',
    shortName: 'Rooftop Units',
    models: ['UATYQ100FC', 'DPS-RTU-080'],
    controllerTypes: ['MicroTech RTU Controller'],
    primaryManualCode: 'D-EIMRT00619-21_03EN',
    image: HERO_CHILLER_IMAGE,
    summary:
      'High-capacity commercial rooftop packaged units with free-cooling economizers, CO2 demand ventilation, and plug-and-play BMS connectivity.',
    tracks: {
      beginner: {
        title: 'Roof Curb Structural Alignment & Weather Sealing',
        duration: '1h 50m',
        topics: [
          'Roof curb level tolerance (max ±2 mm/m) and gasket installation',
          'Downflow vs horizontal supply/return field conversion panels',
          'Outdoor air hood assembly and mist eliminator filter installation',
        ],
      },
      intermediate: {
        title: 'Economizer Free-Cooling Logic & Condenser Fan Staging',
        duration: '2h 40m',
        topics: [
          'Dry-bulb and enthalpy comparative free-cooling changeover setup',
          'Building over-pressurization relief fan / barometric damper tuning',
          'Condensate trap priming on high-static negative-pressure blower sections',
        ],
      },
      advanced: {
        title: 'Multi-Stage Capacity Modulation & Supply Air Reset',
        duration: '3h 25m',
        topics: [
          'Inverter lead compressor + fixed speed lag scroll coordination',
          'Return air vs space temperature cascade control loops',
          'BACnet IP integration with central plant EMS',
        ],
      },
    },
  },
  {
    id: 'controls-bms',
    index: '11',
    name: 'Daikin Controls and BMS Integration',
    shortName: 'Controls & BMS',
    models: ['MicroTech IV', 'iTM-DCM601A51', 'DMS502B51-BACnet', 'DIII-Net-Modbus-RTD'],
    controllerTypes: ['BACnet IP / MS/TP', 'Modbus RTU / TCP', 'DIII-Net'],
    primaryManualCode: 'D-EIMBM01104-22_04EN',
    image: THUMB_VRV_SYSTEM,
    summary:
      'Building Management System (BMS) gateways, BACnet IP/MS-TP & Modbus protocol integration, intelligent Touch Manager (iTM), and chiller plant sequencing.',
    tracks: {
      beginner: {
        title: 'BACnet vs Modbus vs DIII-Net Protocol Fundamentals',
        duration: '2h 20m',
        topics: [
          'Architectural comparison: BACnet IP/MS-TP object model (AI, AO, BI, BO, MSI) vs Modbus register tables (Holding/Input)',
          'RS-485 physical layer rules: 120-Ohm end-of-line termination resistors, daisy-chain topology, shielded twisted pair',
          'DIII-Net F1/F2 16V DC communication bus voltage checks',
        ],
      },
      intermediate: {
        title: 'MicroTech & iTM Gateway Configuration & Point Mapping',
        duration: '3h 30m',
        topics: [
          'Configuring Device Instance ID, MAC Address, and Baud Rate (9600 / 19200 / 38400 / 76800 bps) on MicroTech communication cards',
          'Mapping Chiller Enable, Leaving Water Setpoint Reset, Demand Limit, and Alarm Status objects',
          'Resolving BMS communication offline faults, duplicate MAC addresses, and ground loop noise',
        ],
      },
      advanced: {
        title: 'Central Chiller Plant Manager & Heartbeat Watchdog Fail-Safe',
        duration: '4h 15m',
        topics: [
          'Network heartbeat watchdog timer configuration (fallback from Network Mode to Local Mode on BMS loss)',
          'Chiller plant staging: motorized isolation valve prove-open interlock before primary/variable pump and chiller start',
          'YABE / Modbus Poll diagnostic packet capture and COV subscription tuning',
        ],
      },
    },
  },
  {
    id: 'related-hvac-equipment',
    index: '12',
    name: 'Related HVAC Equipment: Pumps, VFDs, Valves, Sensors, Actuators, Flow Switches & Electrical',
    shortName: 'Pumps, VFDs, Valves & Sensors',
    models: ['IFM-FS-DN150', 'DRV-VFD-400V', 'PICV-DN80', 'PT1000-CHW'],
    controllerTypes: ['0-10V / 4-20mA Analog', 'Modbus VFD', 'Dry-Contact Safety Interlock'],
    primaryManualCode: 'D-EIMAX00801-21_02EN',
    image: HERO_CHILLER_IMAGE,
    summary:
      'Essential plantroom balance-of-plant components: chilled-water pumps, Variable Frequency Drives (VFDs), PICVs, thermal dispersion & paddle flow switches, immersion sensors, and MCC switchgear.',
    tracks: {
      beginner: {
        title: 'Hydronic Valves, Strainers, Flow Switches & Sensor Placement',
        duration: '2h 05m',
        topics: [
          'Butterfly isolation valves, Y-strainers (with blowdown valves), double regulating valves (DRV), and flexible bellows',
          'Flow switch straight-pipe run rule (minimum 5x pipe diameters upstream and 5x downstream from elbows/valves)',
          'Immersion temperature sensor thermal paste and thermowell insertion depth',
        ],
      },
      intermediate: {
        title: 'Chilled-Water Pump Alignment, VFD Parameterization & Minimum Flow',
        duration: '3h 15m',
        topics: [
          'End-suction and split-case pump laser coupling alignment and mechanical seal venting',
          'VFD motor nameplate entry, minimum frequency limit (typically 25–30 Hz per chiller minimum flow), and carrier frequency',
          'Differential pressure sensor placement at index circuit (2/3 distance down longest hydronic riser)',
        ],
      },
      advanced: {
        title: 'Safety Interlock Loop Integrity & Electrical Harmonic Mitigation',
        duration: '3h 45m',
        topics: [
          'Hardwired chiller-to-pump-to-flow-switch safety interlock loop testing (flow loss trip within 3–5 seconds)',
          'Insulation resistance (Megger 500V DC) testing on pump/compressor motors (disconnect VFD before Megger test!)',
          'VFD dV/dt filters, shielded motor cables, and 360-degree EMC cable gland earthing',
        ],
      },
    },
  },
];

export interface SeededTechnicalDoc {
  id: string;
  title: string;
  docCode: string;
  category: string;
  modelNumber: string;
  modelFamily: string;
  revision: string;
  docType: string;
  sectionRef: string;
  extractedContent: string;
  safetyNotes: string;
  status: 'draft' | 'approved' | 'archived';
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_TECHNICAL_DOCUMENTS: SeededTechnicalDoc[] = [
  {
    id: 'doc_ewad_tz_iom',
    title: 'Daikin EWAD-TZ-B Air-Cooled Inverter Screw Chiller Installation & Operation Manual',
    docCode: 'D-EIMAC01405-21_04EN',
    category: 'Daikin Air-Cooled Chillers',
    modelNumber: 'EWAD-TZ-B',
    modelFamily: 'EWAD-TZ',
    revision: 'Rev 2026.04',
    docType: 'Installation & Operation Manual (IOM)',
    sectionRef: 'Sections 3.2, 4.4, 5.1 & 7.3 (Pages 18–54)',
    extractedContent: `VERIFIED MANUFACTURER REQUIREMENTS (EWAD-TZ-B Series):
1. FOUNDATION & LEVELING (Sec 3.2, p.18): Unit must be installed on a level concrete pad or steel frame capable of supporting operating weight. Levelness tolerance must be within <= 5 mm across the unit length and width. Anti-vibration spring or rubber mounts must be positioned strictly per the unit-specific General Arrangement (GA) point-load drawing.
2. SERVICE & AIRFLOW CLEARANCES (Sec 3.4, p.21): Minimum 1800 mm clearance required on control panel side and condenser coil sides; minimum 2500 mm when two chillers are installed side-by-side to prevent hot air recirculation. No overhead obstructions allowed above axial condenser fans.
3. CHILLED WATER PIPING & FLOW SWITCH (Sec 4.4, p.31): Install a mechanical mesh strainer (maximum mesh size 1.0 mm) directly upstream of the evaporator water inlet. A calibrated flow switch (thermal dispersion IFM or paddle type) MUST be installed on the evaporator outlet connection with a minimum of 5 pipe diameters (5D) of straight pipe upstream and downstream, wired to the dedicated factory digital interlock terminals on the MicroTech controller.
4. ELECTRICAL REQUIREMENTS (Sec 5.1, p.42): Supply voltage 400V / 3Ph / 50Hz (±10%). Phase voltage imbalance must not exceed 2%; current imbalance must not exceed 10%. Crankcase/oil heaters must be energized at least 12 hours prior to initial compressor start-up.
5. EVAPORATOR WATER QUALITY & TEST (Sec 4.6, p.36): Closed loop must be flushed bypassing the chiller evaporator first. Design water pressure test max 10.0 bar (1.0 MPa). Standard leaving chilled water temperature range +4.0°C to +15.0°C (without glycol).`,
    safetyNotes:
      'WARNING: Perform full Lockout/Tagout (LOTO) before opening main electrical panel. Wait minimum 15 minutes after isolating power for inverter DC bus capacitors to discharge below 20V DC before touching VFD components. Never jumper or bypass the evaporator water flow switch; doing so risks catastrophic evaporator freeze-up and vessel rupture.',
    status: 'approved',
    uploadedBy: 'system_admin',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 'doc_ewwd_vz_service',
    title: 'Daikin EWWD-VZ Water-Cooled Inverter Screw Chiller Service & Commissioning Manual',
    docCode: 'D-EIMWC01203-19_02EN',
    category: 'Daikin Water-Cooled Chillers',
    modelNumber: 'EWWD-VZ',
    modelFamily: 'EWWD-VZ',
    revision: 'Rev 2026.02',
    docType: 'Service & Commissioning Manual',
    sectionRef: 'Sections 2.3, 6.2 & 8.1 (Pages 14–68)',
    extractedContent: `VERIFIED MANUFACTURER REQUIREMENTS (EWWD-VZ Series):
1. EVAPORATOR & CONDENSER FLOW INTERLOCKS (Sec 2.3, p.14): Both chilled water (evaporator) and cooling tower water (condenser) circuits require independent flow proof interlocks (flow switches or differential pressure switches) wired to MicroTech IV controller terminals. Chiller will not enter Run state until flow is proven continuously for 15 seconds.
2. APPROACH TEMPERATURE BENCHMARKS (Sec 6.2, p.49): At 100% nominal load with clean heat exchanger tubes, normal Evaporator Approach (Leaving Chilled Water Temp minus Saturated Suction Temp) is 1.0 K to 2.5 K. Normal Condenser Approach (Saturated Discharge Temp minus Leaving Condenser Water Temp) is 1.0 K to 3.0 K. A condenser approach exceeding 4.0 K indicates condenser tube fouling, non-condensable gases, or scale buildup.
3. WATER QUALITY PARAMETERS (Sec 8.1, p.64): pH 7.5–9.0, electrical conductivity < 500 uS/cm, hardness (CaCO3) 50–150 mg/L, Chloride ions < 50 mg/L.
4. PRE-START CHECKS (Sec 6.1, p.45): Verify compressor suction/discharge service valves and liquid line king valve are 100% open. Verify VFD cooling line solenoid valve operation and oil sump temperature >= +10 K above ambient saturation temperature.`,
    safetyNotes:
      'DANGER: Dual pressure relief valves on shell-and-tube vessels must be piped outdoors in accordance with EN 378 / ASHRAE 15. Never close both liquid line and discharge valves simultaneously on a liquid-full portion of the circuit.',
    status: 'approved',
    uploadedBy: 'system_admin',
    createdAt: '2026-10-02T09:00:00Z',
    updatedAt: '2026-10-02T09:00:00Z',
  },
  {
    id: 'doc_vrv_iv_databook',
    title: 'Daikin VRV IV / V Heat Pump & Heat Recovery Installation & Service Manual',
    docCode: 'D-EIMVRV0418-21_05EN',
    category: 'Daikin VRV / VRF Systems',
    modelNumber: 'REYQ16T',
    modelFamily: 'REYQ-T / RXYQ-T',
    revision: 'Rev 2026.05',
    docType: 'Installation & Service Manual',
    sectionRef: 'Sections 4.1, 5.3, 6.4 & 9.2 (Pages 22–112)',
    extractedContent: `VERIFIED MANUFACTURER REQUIREMENTS (REYQ16T / RXYQ18T / FXFQ100A):
1. REFNET PIPING & BRAZING (Sec 4.1, p.22): Use only phosphorus-copper brazing alloy without flux while continuously purging dry oxygen-free nitrogen at 0.02 MPa (0.2 bar) through the piping to prevent internal copper oxide scale formation that clogs Electronic Expansion Valves (EVs). REFNET joints must be installed horizontally within ±15 degrees and with minimum 500 mm straight pipe before bends.
2. 3-STAGE NITROGEN PRESSURE TEST (Sec 5.3, p.48): With outdoor unit stop valves CLOSED, pressurize liquid, gas, and high/low pressure gas pipes with dry nitrogen in three steps:
   - Step 1: 0.3 MPa (3.0 bar) for 3 minutes minimum (detect major leaks).
   - Step 2: 1.5 MPa (15.0 bar) for 5 minutes minimum.
   - Step 3: 4.0 MPa (40.0 bar) held for 24 hours, applying ambient temperature correction factor of ±0.01 MPa per 1°C ambient change.
3. TRIPLE EVACUATION (Sec 5.4, p.52): Evacuate simultaneously from liquid and gas service ports down to below -100.7 kPa (500 microns / 4 Torr absolute) and hold vacuum pump running for at least 1 hour, followed by a 1-hour standing vacuum rise test.
4. DIII-NET COMMUNICATION WIRING (Sec 6.4, p.67): Use 2-core stranded non-polar wiring (0.75 to 1.25 mm2) on terminals F1 and F2. Never bundle F1-F2 communication cable with high-voltage power cables; maintain >= 50 mm separation. Total bus length max 1000 m.`,
    safetyNotes:
      'WARNING: Never use oxygen or flammable gases for pressure testing. Always weigh in additional R-410A refrigerant in liquid state into the liquid service port with compressor OFF before initiating automated commissioning test run.',
    status: 'approved',
    uploadedBy: 'system_admin',
    createdAt: '2026-10-03T10:00:00Z',
    updatedAt: '2026-10-03T10:00:00Z',
  },
  {
    id: 'doc_ahu_fahu_iom',
    title: 'Daikin Modular AHU & FAHU Installation, Operation & Maintenance Manual',
    docCode: 'D-EIMAH00108-22_01EN',
    category: 'Daikin AHUs (Air Handling Units)',
    modelNumber: 'DAM-AHU-040',
    modelFamily: 'DAM-AHU / DPS-FAHU',
    revision: 'Rev 2026.01',
    docType: 'Installation & Maintenance Manual',
    sectionRef: 'Sections 3.5, 4.2 & 7.1 (Pages 12–46)',
    extractedContent: `VERIFIED MANUFACTURER REQUIREMENTS (DAM-AHU-040 & DPS-FAHU-100):
1. FAN SHIPPING BRACKETS & ANTI-VIBRATION (Sec 3.5, p.15): Before energizing the supply or extract fan, ALL red/yellow painted transit locking bolts on the internal spring isolators MUST be removed and fan impeller free rotation verified by hand. Failure to remove transit locks causes severe structural vibration across the FAHU/AHU casing.
2. CONDENSATE SIPHON / U-TRAP HEIGHT (Sec 4.2, p.24): For negative pressure (draw-through) coil sections, the drain trap height H (mm) must be at least 1.5 x the maximum negative static pressure (in mmH2O / 10 Pa) so air is not sucked back through the drain line causing condensate carry-over and flooding. Fill siphon with water prior to start-up.
3. CHILLED WATER COIL PIPING (Sec 4.3, p.27): Connect chilled water in strict counter-flow arrangement (water enters bottom header on leaving-air side and exits top header on entering-air side). Support external steel piping independently so zero pipe weight or torque rests on copper coil headers.
4. HEAT RECOVERY WHEEL CHECKS (DPS-FAHU-100, Sec 7.1, p.39): Verify rotary enthalpy wheel belt tension, labyrinth brush seals, and rotation direction arrow. Verify purge sector setting matches supply/exhaust pressure differential.`,
    safetyNotes:ReferenceError: require is not defined in ES module scope, you can use import instead
    at file:///workspace/server.js:25

      'WARNING: Isolate main power and wait for EC/VFD fan impellers to come to a complete standstill before opening AHU/FAHU access doors. Positive-pressure doors can swing open forcefully if opened while fans are running.',
    status: 'approved',
    uploadedBy: 'system_admin',
    createdAt: '2026-10-04T11:00:00Z',
    updatedAt: '2026-10-04T11:00:00Z',
  },
  {
    id: 'doc_bms_controls_guide',
    title: 'Daikin MicroTech IV & DIII-Net BACnet / Modbus Integration Engineering Manual',
    docCode: 'D-EIMBM01104-22_04EN',
    category: 'Daikin Controls and BMS Integration',
    modelNumber: 'MicroTech IV',
    modelFamily: 'MicroTech III / IV / iTM',
    revision: 'Rev 2026.04',
    docType: 'Engineering & BMS Manual',
    sectionRef: 'Sections 2.1, 3.4 & 5.2 (Pages 8–44)',
    extractedContent: `VERIFIED MANUFACTURER REQUIREMENTS (MicroTech IV & DIII-Net Gateways):
1. BACNET VS MODBUS PROTOCOL DIFFERENCES (Sec 2.1, p.8):
   - BACnet (ASHRAE 135 / ISO 16484-5) is an object-oriented building automation protocol supporting self-describing objects (Analog Input, Analog Value, Binary Value, Multi-State Input), Change-of-Value (COV) subscriptions, and device discovery (Who-Is / I-Am) over BACnet/IP (UDP Port 47808) or BACnet MS/TP (RS-485 token-passing master/slave).
   - Modbus (RTU over RS-485 or TCP over Port 502) is a master/slave polling register protocol using raw numeric addresses (Coils 0xxxx, Discrete Inputs 1xxxx, Input Registers 3xxxx, Holding Registers 4xxxx) requiring the exact Daikin register scaling table (e.g., value / 10 for °C).
2. RS-485 WIRING & TERMINATION (Sec 3.4, p.19): For BACnet MS/TP or Modbus RTU, use 24 AWG shielded twisted pair cable (characteristic impedance 120 Ohm) in strict daisy-chain topology (no star or T-taps). Enable the 120-Ohm End-of-Line (EOL) termination DIP switch ONLY at the two physical ends of the RS-485 trunk. Shield drain wire must be earthed at one end only to prevent ground loops.
3. BMS COMMUNICATION TROUBLESHOOTING (Sec 5.2, p.37):
   - Verify Control Source on MicroTech HMI is set to "Network" when writing setpoints/enable via BMS.
   - Verify unique BACnet Device Instance ID and unique MS/TP MAC Address (0–127) or Modbus Slave ID (1–247).
   - Verify matching Baud Rate (default 38400 bps for BACnet MS/TP; 19200 bps Even parity 1 stop bit for Modbus RTU).`,
    safetyNotes:
      'CAUTION: Hardwired safety interlocks (Emergency Stop, Chilled Water Flow Switch, High Pressure Cutout) remain active in the unit controller at all times and MUST NEVER be routed solely through software BMS points.',
    status: 'approved',
    uploadedBy: 'system_admin',
    createdAt: '2026-10-05T12:00:00Z',
    updatedAt: '2026-10-05T12:00:00Z',
  },
];

export interface InstallationStepItem {
  id: string;
  stageNumber: 1 | 2 | 3 | 4;
  stageTitle: string;
  stepCode: string;
  title: string;
  manufacturerInstruction: string;
  manualRef: string;
  isHoldPoint: boolean;
  holdPointAuthority?: string;
  verificationMethod: string;
}

export const INSTALLATION_STAGES: InstallationStepItem[] = [
  // Stage 1: Before Installation
  {
    id: 'inst_1_1',
    stageNumber: 1,
    stageTitle: 'Stage 1: Before Installation',
    stepCode: '1.1',
    title: 'Verify approved equipment model and submittals',
    manufacturerInstruction:
      'Cross-check unit physical nameplate (Model, Serial Number, Refrigerant Type/Charge, Power Supply 400V/3Ph/50Hz, Design Pressures) against Consultant-Approved Material Submittal and latest IFC Schedule.',
    manualRef: 'D-EIMAC01405-21_04EN · Sec 2.1 (p.9)',
    isHoldPoint: true,
    holdPointAuthority: 'MEP Consultant / QA-QC Engineer',
    verificationMethod: 'Nameplate vs Approved Submittal comparison & Material Inspection Request (MIR)',
  },
  {
    id: 'inst_1_2',
    stageNumber: 1,
    stageTitle: 'Stage 1: Before Installation',
    stepCode: '1.2',
    title: 'Review IOM and General Arrangement (GA) drawings',
    manufacturerInstruction:
      'Verify latest revision of Daikin IOM and certified GA drawing are present at workface. Confirm center-of-gravity coordinates, isolator point loads, and water/power entry locations.',
    manualRef: 'D-EIMAC01405-21_04EN · Sec 3.1 (p.16)',
    isHoldPoint: false,
    verificationMethod: 'Document Revision Control Check',
  },
  {
    id: 'inst_1_3',
    stageNumber: 1,
    stageTitle: 'Stage 1: Before Installation',
    stepCode: '1.3',
    title: 'Check delivery and equipment condition',
    manufacturerInstruction:
      'Inspect condenser microchannel/fin coils, control panels, piping stubs, and factory holding/refrigerant pressure gauges for any transit damage or leaks prior to offloading.',
    manualRef: 'D-EIMAC01405-21_04EN · Sec 2.2 (p.11)',
    isHoldPoint: true,
    holdPointAuthority: 'Site Receiving & Daikin Logistics Representative',
    verificationMethod: 'Delivery Receiving Checklist & Factory Pressure Gauge Photo',
  },
  {
    id: 'inst_1_4',
    stageNumber: 1,
    stageTitle: 'Stage 1: Before Installation',
    stepCode: '1.4',
    title: 'Verify equipment dimensions, weight, and foundation requirements',
    manufacturerInstruction:
      'Confirm concrete plinth or structural steel base dimensions, elevation, and load capacity match operating weight. Foundation surface levelness must be within <= 5 mm across total unit length and width.',
    manualRef: 'D-EIMAC01405-21_04EN · Sec 3.2 (p.18)',
    isHoldPoint: true,
    holdPointAuthority: 'Civil / Structural Inspector',
    verificationMethod: 'Optical Level Survey Report & Plinth Sign-Off',
  },
  {
    id: 'inst_1_5',
    stageNumber: 1,
    stageTitle: 'Stage 1: Before Installation',
    stepCode: '1.5',
    title: 'Check required maintenance and airflow clearances',
    manufacturerInstruction:
      'Verify minimum 1800 mm service/airflow clearance around coil and control panel sides, minimum 2500 mm between adjacent chillers, and unobstructed vertical discharge above axial condenser fans.',
    manualRef: 'D-EIMAC01405-21_04EN · Sec 3.4 (p.21)',
    isHoldPoint: false,
    verificationMethod: 'Laser Distance Tape Verification vs Approved Shop Drawing',
  },
  {
    id: 'inst_1_6',
    stageNumber: 1,
    stageTitle: 'Stage 1: Before Installation',
    stepCode: '1.6',
    title: 'Verify lifting access, lifting plan, permits, and approved MSRA',
    manufacturerInstruction:
      'Rig exclusively from designated baseframe lifting eyes using certified spreader bars so lifting slings never contact condenser coils or cabinetry. Confirm Permit-to-Work (PTW) and Approved Method Statement & Risk Assessment (MSRA).',
    manualRef: 'D-EIMAC01405-21_04EN · Sec 2.4 (p.13)',
    isHoldPoint: true,
    holdPointAuthority: 'HSE Lifting Supervisor & Appointed Person',
    verificationMethod: 'Approved Lifting Plan, Crane Third-Party Certificate & PTW',
  },

  // Stage 2: Mechanical Installation
  {
    id: 'inst_2_1',
    stageNumber: 2,
    stageTitle: 'Stage 2: Mechanical Installation',
    stepCode: '2.1',
    title: 'Equipment positioning, leveling, and anti-vibration mounting',
    manufacturerInstruction:
      'Place spring or elastomer anti-vibration mounts strictly at color-coded locations per Daikin point-load diagram (compressor end carries higher static load). Adjust leveling bolts until baseframe is level within <= 5 mm.',
    manualRef: 'D-EIMAC01405-21_04EN · Sec 3.3 (p.19)',
    isHoldPoint: true,
    holdPointAuthority: 'Mechanical QA/QC Engineer',
    verificationMethod: 'Isolator Deflection Measurement & Spirit Level Record',
  },
  {
    id: 'inst_2_2',
    stageNumber: 2,
    stageTitle: 'Stage 2: Mechanical Installation',
    stepCode: '2.2',
    title: 'Chilled-water piping connections, flexible connectors, and independent supports',
    manufacturerInstruction:
      'Connect CHW supply and return strictly matching evaporator "WATER IN" and "WATER OUT" labels. Install flexible EPDM/stainless bellows at inlet and outlet, and support all piping weight independently on pipe hangers.',
    manualRef: 'D-EIMAC01405-21_04EN · Sec 4.1–4.2 (p.28)',
    isHoldPoint: false,
    verificationMethod: 'Flange Alignment & Pipe Hanger Load Check',
  },
  {
    id: 'inst_2_3',
    stageNumber: 2,
    stageTitle: 'Stage 2: Mechanical Installation',
    stepCode: '2.3',
    title: 'Valve packages, 1.0 mm mesh strainer, and flow switch installation',
    manufacturerInstruction:
      'Install isolation butterfly valves, balancing valve (DRV/PICV), thermometer pockets, pressure gauges, 1.0 mm max mesh strainer directly upstream of evaporator inlet, and calibrated flow switch on outlet with >= 5D straight pipe.',
    manualRef: 'D-EIMAC01405-21_04EN · Sec 4.4 (p.31)',
    isHoldPoint: true,
    holdPointAuthority: 'Commissioning Engineer / MEP Consultant',
    verificationMethod: 'Strainer Mesh Inspection & Flow Switch Straight-Run Verification',
  },
  {
    id: 'inst_2_4',
    stageNumber: 2,
    stageTitle: 'Stage 2: Mechanical Installation',
    stepCode: '2.4',
    title: 'Drainage, closed-cell insulation, cladding, flushing, and pressure testing',
    manufacturerInstruction:
      'Hydrostatically pressure test CHW piping up to design pressure (max 10.0 bar at evaporator), flush piping network via temporary bypass loop BEFORE opening chiller isolation valves, verify water chemistry, then apply vapor-sealed insulation and aluminum cladding.',
    manualRef: 'D-EIMAC01405-21_04EN · Sec 4.6 (p.36)',
    isHoldPoint: true,
    holdPointAuthority: 'MEP Consultant Witness',
    verificationMethod: 'Signed Hydrotest Certificate, Flushing Report & Water Lab Analysis',
  },

  // Stage 3: Electrical Installation
  {
    id: 'inst_3_1',
    stageNumber: 3,
    stageTitle: 'Stage 3: Electrical Installation',
    stepCode: '3.1',
    title: 'Incoming power supply, isolator, cable & breaker verification',
    manufacturerInstruction:
      'Verify MCC circuit breaker rating, armoured power cable cross-section, and local weatherproof main disconnect switch match unit Electrical Data plate (MCA / MFA). Verify gland plate entry seals IP54 integrity.',
    manualRef: 'D-EIMAC01405-21_04EN · Sec 5.1 (p.42)',
    isHoldPoint: false,
    verificationMethod: 'Cable Schedule Check & Calibrated Torque Wrench Log',
  },
  {
    id: 'inst_3_2',
    stageNumber: 3,
    stageTitle: 'Stage 3: Electrical Installation',
    stepCode: '3.2',
    title: 'Earthing verification, phase sequence, and voltage imbalance checks',
    manufacturerInstruction:
      'Verify protective earth (PE) continuity (< 0.1 Ohm), insulation resistance (Megger test with VFD isolated), clockwise L1-L2-L3 phase rotation, and supply voltage 400V ±10% with < 2% phase voltage imbalance.',
    manualRef: 'D-EIMAC01405-21_04EN · Sec 5.2 (p.44)',
    isHoldPoint: true,
    holdPointAuthority: 'Authorized Electrical Engineer',
    verificationMethod: 'Phase Rotation Meter & Calibrated Multimeter Test Sheet',
  },
  {
    id: 'inst_3_3',
    stageNumber: 3,
    stageTitle: 'Stage 3: Electrical Installation',
    stepCode: '3.3',
    title: 'Control wiring, flow switch interlock, and BMS communication',
    manufacturerInstruction:
      'Terminate voltage-free flow switch contact, primary CHW pump status interlock, remote enable/stop, and shielded RS-485 BACnet/Modbus cable (separated >= 50 mm from power cables) per factory wiring diagram inside panel door.',
    manualRef: 'D-EIMAC01405-21_04EN · Sec 5.4 (p.47)',
    isHoldPoint: false,
    verificationMethod: 'Point-to-Point Continuity & Loop Check Sheet',
  },

  // Stage 4: Installation Inspection
  {
    id: 'inst_4_1',
    stageNumber: 4,
    stageTitle: 'Stage 4: Installation Inspection',
    stepCode: '4.1',
    title: 'Complete mechanical & electrical checklists and clearance audit',
    manufacturerInstruction:
      'Verify all mechanical and electrical installation items are complete, coils are clean and free of fin damage, and all access panels and safety guards are secured.',
    manualRef: 'D-EIMAC01405-21_04EN · Sec 6.1 (p.51)',
    isHoldPoint: false,
    verificationMethod: 'Internal QA/QC Walkdown Snag Sheet',
  },
  {
    id: 'inst_4_2',
    stageNumber: 4,
    stageTitle: 'Stage 4: Installation Inspection',
    stepCode: '4.2',
    title: 'Attach installation photo evidence, resolve punch-list items, and submit WIR',
    manufacturerInstruction:
      'Compile dated photographic evidence (nameplate, isolator deflection, strainer, flow switch straight run, earthing, control terminations), close all Category A snags, and issue formal Work Inspection Request (WIR) prior to Pre-Commissioning.',
    manualRef: 'D-EIMAC01405-21_04EN · Sec 6.2 (p.53)',
    isHoldPoint: true,
    holdPointAuthority: 'MEP Consultant & Commissioning Authority (CxA)',
    verificationMethod: 'Signed Work Inspection Request (WIR) Package',
  },
];

export interface PreCommItemTemplate {
  id: string;
  code: string;
  title: string;
  acceptanceCriteria: string;
  manualReference: string;
  unit?: string;
  defaultStatus: 'PASS' | 'FAIL' | 'NOT APPLICABLE' | 'PENDING';
  defaultMeasurement: string;
  defaultInspector: string;
  defaultDate: string;
  defaultComment: string;
}

export const PRE_COMMISSIONING_ITEMS: PreCommItemTemplate[] = [
  {
    id: 'pc_01',
    code: 'PC-01',
    title: 'Approved installation completion (WIR sign-off)',
    acceptanceCriteria: 'Signed Mechanical & Electrical WIR with Approved IFC Shop Drawings at site',
    manualReference: 'D-EIMAC01405-21_04EN · Sec 6.1 (p.51)',
    defaultStatus: 'PASS',
    defaultMeasurement: 'WIR-MEP-042 Approved',
    defaultInspector: 'Eng. Tariq Al-Mansoor',
    defaultDate: '2026-11-10',
    defaultComment: 'Verified against approved submittal Rev 03.',
  },
  {
    id: 'pc_02',
    code: 'PC-02',
    title: 'Mechanical installation inspection (Leveling & Anti-Vibration)',
    acceptanceCriteria: 'Unit level <= 5 mm; spring isolators positioned per GA point-load diagram, shipping bolts removed',
    manualReference: 'D-EIMAC01405-21_04EN · Sec 3.2–3.3 (p.18)',
    unit: 'mm',
    defaultStatus: 'PASS',
    defaultMeasurement: '2.4 mm level delta',
    defaultInspector: 'Eng. Tariq Al-Mansoor',
    defaultDate: '2026-11-10',
    defaultComment: 'All 8 spring mounts unlocked and deflected evenly.',
  },
  {
    id: 'pc_03',
    code: 'PC-03',
    title: 'Electrical installation inspection (Cables, Torque & Earthing)',
    acceptanceCriteria: 'Power terminals torqued to spec; PE earth resistance < 0.1 Ohm; Megger >= 100 MOhm',
    manualReference: 'D-EIMAC01405-21_04EN · Sec 5.1–5.2 (p.42)',
    unit: 'Ohm / MOhm',
    defaultStatus: 'PASS',
    defaultMeasurement: '0.04 Ohm PE / >200 MOhm',
    defaultInspector: 'Eng. Sami Haddad',
    defaultDate: '2026-11-10',
    defaultComment: 'Torque witness marks applied on L1/L2/L3/PE lugs.',
  },
  {
    id: 'pc_04',
    code: 'PC-04',
    title: 'Water flushing report verification',
    acceptanceCriteria: 'Closed-loop flushing completed via chiller bypass before opening evaporator valves; turbidity < 10 NTU',
    manualReference: 'D-EIMAC01405-21_04EN · Sec 4.6 (p.36)',
    unit: 'NTU',
    defaultStatus: 'PASS',
    defaultMeasurement: '4.2 NTU Clear',
    defaultInspector: 'Eng. Tariq Al-Mansoor',
    defaultDate: '2026-11-11',
    defaultComment: 'Bypass flushing witnessed; evaporator remained isolated during chemical flush.',
  },
  {
    id: 'pc_05',
    code: 'PC-05',
    title: 'Water quality test report verification',
    acceptanceCriteria: 'Lab report confirms pH 7.5–9.0, Conductivity < 500 uS/cm, Chloride < 50 mg/L, Inhibitor dosed',
    manualReference: 'D-EIMWC01203-19_02EN · Sec 8.1 (p.64)',
    unit: 'pH / uS/cm',
    defaultStatus: 'PASS',
    defaultMeasurement: 'pH 8.1 / 310 uS/cm',
    defaultInspector: 'ChemLab QA',
    defaultDate: '2026-11-11',
    defaultComment: 'Certified water lab report attached.',
  },
  {
    id: 'pc_06',
    code: 'PC-06',
    title: 'Pressure testing documentation',
    acceptanceCriteria: 'Signed hydrostatic pressure test certificate (1.5x working pressure, max 10.0 bar at evaporator) with zero pressure drop',
    manualReference: 'D-EIMAC01405-21_04EN · Sec 4.6 (p.36)',
    unit: 'bar',
    defaultStatus: 'PASS',
    defaultMeasurement: '9.5 bar held 24h (0 drop)',
    defaultInspector: 'Eng. Tariq Al-Mansoor',
    defaultDate: '2026-11-11',
    defaultComment: 'Calibrated gauge cert #GAU-8812.',
  },
  {
    id: 'pc_07',
    code: 'PC-07',
    title: 'Strainer inspection (1.0 mm max mesh)',
    acceptanceCriteria: 'Y-strainer basket removed, inspected clean after flushing, <= 1.0 mm perforation installed on evaporator inlet',
    manualReference: 'D-EIMAC01405-21_04EN · Sec 4.4 (p.31)',
    unit: 'mm mesh',
    defaultStatus: 'PASS',
    defaultMeasurement: '0.8 mm clean mesh',
    defaultInspector: 'Eng. Tariq Al-Mansoor',
    defaultDate: '2026-11-11',
    defaultComment: 'Strainer blowdown valve installed and capped.',
  },
  {
    id: 'pc_08',
    code: 'PC-08',
    title: 'Chilled-water flow verification & balancing',
    acceptanceCriteria: 'Design chilled-water flow rate verified within ±10% via PICV/DRV ultrasonic flow meter and evaporator Delta-P',
    manualReference: 'D-EIMAC01405-21_04EN · Sec 4.5 (p.34)',
    unit: 'L/s / kPa',
    defaultStatus: 'PASS',
    defaultMeasurement: '28.5 L/s (34.2 kPa dP)',
    defaultInspector: 'TAB Specialist',
    defaultDate: '2026-11-12',
    defaultComment: 'Matches submittal nominal evaporator flow curve.',
  },
  {
    id: 'pc_09',
    code: 'PC-09',
    title: 'Air removal and venting',
    acceptanceCriteria: 'Automatic and manual high-point air vents bled at evaporator top header and coil headers until steady water stream',
    manualReference: 'D-EIMAC01405-21_04EN · Sec 4.4 (p.32)',
    defaultStatus: 'PASS',
    defaultMeasurement: 'Zero air pockets',
    defaultInspector: 'Eng. Tariq Al-Mansoor',
    defaultDate: '2026-11-12',
    defaultComment: 'Expansion tank pre-charge pressure verified.',
  },
  {
    id: 'pc_10',
    code: 'PC-10',
    title: 'Electrical measurements & 12h crankcase heater pre-heat',
    acceptanceCriteria: '400V ±10%, phase voltage imbalance < 2%, clockwise phase rotation, crankcase heater energized >= 12 hours before start',
    manualReference: 'D-EIMAC01405-21_04EN · Sec 5.1 (p.42)',
    unit: 'V / % / hrs',
    defaultStatus: 'PASS',
    defaultMeasurement: '401V / 0.6% imb / 16h preheat',
    defaultInspector: 'Eng. Sami Haddad',
    defaultDate: '2026-11-12',
    defaultComment: 'Oil sump temperature verified warm (+38.5°C vs +24°C ambient).',
  },
  {
    id: 'pc_11',
    code: 'PC-11',
    title: 'Safety device & flow switch physical trip verification',
    acceptanceCriteria: 'Flow switch wired to hardwired MicroTech digital input; closing CHW outlet valve trips flow contact within 3–5 seconds',
    manualReference: 'D-EIMAC01405-21_04EN · Sec 4.4 & 7.2 (p.31, 52)',
    unit: 'seconds',
    defaultStatus: 'PASS',
    defaultMeasurement: 'Trips at <75% flow in 3.2s',
    defaultInspector: 'Eng. Sami Haddad',
    defaultDate: '2026-11-12',
    defaultComment: 'Verified open contact prevents compressor enable.',
  },
  {
    id: 'pc_12',
    code: 'PC-12',
    title: 'Sensor and controller calibration checks',
    acceptanceCriteria: 'Entering/Leaving CHW temperature sensors (EWT/LWT) compared against calibrated reference thermometer within ±0.3 K',
    manualReference: 'D-EIMAC01405-21_04EN · Sec 7.1 (p.50)',
    unit: 'K deviation',
    defaultStatus: 'PASS',
    defaultMeasurement: '0.15 K deviation',
    defaultInspector: 'Eng. Sami Haddad',
    defaultDate: '2026-11-12',
    defaultComment: 'Thermal compound verified inside both evaporator thermowells.',
  },
  {
    id: 'pc_13',
    code: 'PC-13',
    title: 'BMS communication & point-to-point verification',
    acceptanceCriteria: 'BACnet/Modbus gateway online; Enable, LWT Setpoint, Status, and Alarm points verified at central BMS workstation',
    manualReference: 'D-EIMBM01104-22_04EN · Sec 3.4 & 5.2 (p.19, 37)',
    defaultStatus: 'PENDING',
    defaultMeasurement: 'Awaiting BMS Head-End Graphics',
    defaultInspector: 'BMS Engineer',
    defaultDate: '2026-11-13',
    defaultComment: 'RS-485 bus active; final graphics point sign-off scheduled.',
  },
  {
    id: 'pc_14',
    code: 'PC-14',
    title: 'Alarm and pump/valve interlock verification',
    acceptanceCriteria: 'Emergency Stop button, CHW pump run status interlock, and motorized isolation valve end-switch tested',
    manualReference: 'D-EIMAC01405-21_04EN · Sec 5.4 (p.47)',
    defaultStatus: 'PASS',
    defaultMeasurement: 'Interlock sequence verified',
    defaultInspector: 'Eng. Sami Haddad',
    defaultDate: '2026-11-12',
    defaultComment: 'Stopping primary CHW pump immediately drops chiller run permissive.',
  },
  {
    id: 'pc_15',
    code: 'PC-15',
    title: 'Outstanding works and punch-list status',
    acceptanceCriteria: 'Zero Category-A (Safety/Operational) punch items open; minor cosmetic Category-B items logged with target date',
    manualReference: 'D-EIMAC01405-21_04EN · Sec 6.2 (p.53)',
    defaultStatus: 'PASS',
    defaultMeasurement: '0 Cat-A / 1 Cat-B open',
    defaultInspector: 'QA/QC Manager',
    defaultDate: '2026-11-13',
    defaultComment: 'Cat-B: Identification phenolic label on valve BV-04.',
  },
  {
    id: 'pc_16',
    code: 'PC-16',
    title: 'Required manufacturer or consultant attendance scheduled',
    acceptanceCriteria: 'Formal startup notice submitted to Authorized Daikin Service & Consultant CxA for witnessed commissioning',
    manualReference: 'D-EIMAC01405-21_04EN · Sec 7.3 (p.54)',
    defaultStatus: 'PENDING',
    defaultMeasurement: 'Request Ref #CX-2026-119',
    defaultInspector: 'Project Manager',
    defaultDate: '2026-11-13',
    defaultComment: 'Authorized Daikin Service engineer attendance booked.',
  },
];

export interface CommissioningStepGuide {
  stepNumber: number;
  title: string;
  objective: string;
  procedure: string;
  manualRef: string;
  safetyHold: string;
}

export const COMMISSIONING_STEPS: CommissioningStepGuide[] = [
  {
    stepNumber: 1,
    title: 'Document and Permit Verification',
    objective: 'Confirm approved submittals, signed Pre-Commissioning Readiness Report, LOTO/Energization Permits, and Daikin IOM are at the equipment.',
    procedure: 'Verify all Category-A punch items are closed and qualified commissioning personnel hold valid electrical/HVAC authorization.',
    manualRef: 'D-EIMAC01405-21_04EN · Sec 7.1 (p.50)',
    safetyHold: 'Do not proceed with live testing without active Permit-to-Work (PTW).',
  },
  {
    stepNumber: 2,
    title: 'Pre-Start Inspection (Refrigerant Valves & Oil Heaters)',
    objective: 'Ensure compressor oil has been heated for >= 12 hours and all refrigerant circuit service valves are open.',
    procedure: 'Confirm compressor discharge, suction, economizer, and liquid line service valves are fully back-seated (open). Verify oil sump temperature is at least +10 K above ambient.',
    manualRef: 'D-EIMAC01405-21_04EN · Sec 7.2 (p.51)',
    safetyHold: 'Starting a compressor with liquid refrigerant diluted in cold oil causes immediate mechanical seizure.',
  },
  {
    stepNumber: 3,
    title: 'Mechanical and Electrical Readiness',
    objective: 'Verify incoming 3-phase voltage stability, phase balance (<2%), and vibration mount freedom.',
    procedure: 'Measure L1-L2, L2-L3, L3-L1 voltage under standby load and confirm all enclosure doors and fan guards are fastened.',
    manualRef: 'D-EIMAC01405-21_04EN · Sec 5.1 (p.42)',
    safetyHold: 'Use CAT III / CAT IV PPE when taking live voltage readings.',
  },
  {
    stepNumber: 4,
    title: 'Water-Flow and Interlock Verification',
    objective: 'Establish nominal evaporator (and condenser, if water-cooled) flow rate and verify flow switch safety trip.',
    procedure: 'Start CHW pumps, record evaporator pressure drop (kPa) against IOM chart, then throttle outlet valve until flow switch opens to confirm immediate controller safety lockout.',
    manualRef: 'D-EIMAC01405-21_04EN · Sec 4.4–4.5 (p.31–34)',
    safetyHold: 'Mandatory Witness Hold Point: Flow switch trip must be physically proven with water flow reduction.',
  },
  {
    stepNumber: 5,
    title: 'Control Settings and Sensor Checks',
    objective: 'Configure MicroTech IV Leaving Chilled Water Temperature (LWT) setpoint, ramp rates, and glycol freeze threshold.',
    procedure: 'Compare EWT, LWT, ambient, and saturated suction/discharge pressure-temperature readings at zero load for sensor accuracy.',
    manualRef: 'D-EIMAC01405-21_04EN · Sec 7.3 (p.54)',
    safetyHold: 'Never lower evaporator freeze cutout below +2.0°C on plain water systems.',
  },
  {
    stepNumber: 6,
    title: 'Manufacturer-Specified Start-Up Sequence',
    objective: 'Enable unit in Local Mode and observe automated MicroTech pre-purge, EXV initialization, and soft inverter start.',
    procedure: 'Switch unit to ON/Local. Verify compressor starts at minimum frequency/slide position, oil pressure builds immediately, and condenser fans stage smoothly.',
    manualRef: 'D-EIMAC01405-21_04EN · Sec 7.4 (p.55)',
    safetyHold: 'Stand clear of rotating axial condenser fans and keep hand near Emergency Stop during initial rotation.',
  },
  {
    stepNumber: 7,
    title: 'Initial Operating Observation',
    objective: 'Monitor acoustic signature, vibration levels, oil sight glass level, and liquid line sight glass during first 15 minutes.',
    procedure: 'Confirm oil level remains visible in compressor sight glass and no abnormal metallic knock or harmonic pipe vibration occurs.',
    manualRef: 'D-EIMAC01405-21_04EN · Sec 7.5 (p.56)',
    safetyHold: 'Immediately stop unit if oil sight glass empties or abnormal compressor noise occurs.',
  },
  {
    stepNumber: 8,
    title: 'Performance Measurements (Stabilized Load Log)',
    objective: 'Record full thermodynamic and electrical operating parameters at stabilized building load.',
    procedure: 'Log Ambient °C, EWT/LWT °C, Flow L/s, RLA Current per phase, Discharge/Suction Superheat, Subcooling, and Evaporator Approach.',
    manualRef: 'D-EIMWC01203-19_02EN · Sec 6.2 (p.49)',
    safetyHold: 'Compare all readings strictly against the model-specific Daikin Submittal & IOM envelope.',
  },
  {
    stepNumber: 9,
    title: 'Alarm Monitoring and Safety Cutout Review',
    objective: 'Verify zero active alarms or warnings in MicroTech alarm history buffer.',
    procedure: 'Inspect Alarm Log and Event History on HMI; verify high-pressure and low-pressure transducer thresholds match factory configuration.',
    manualRef: 'D-EIMAC01405-21_04EN · Sec 8.1 (p.59)',
    safetyHold: 'Never clear recurring safety alarms without identifying and rectifying the root cause.',
  },
  {
    stepNumber: 10,
    title: 'Part-Load & Staging Functional Testing',
    objective: 'Verify smooth capacity modulation from 25% to 100% load and clean normal pump-down stop sequence.',
    procedure: 'Observe LWT tracking within ±0.5 K of setpoint as building load varies and verify soft unload prior to compressor stop.',
    manualRef: 'D-EIMAC01405-21_04EN · Sec 7.6 (p.57)',
    safetyHold: 'Respect minimum anti-recycle timer between compressor starts.',
  },
  {
    stepNumber: 11,
    title: 'BMS Integration & Network Fail-Safe Test',
    objective: 'Switch MicroTech Control Source to Network and verify remote BMS start/stop, setpoint reset, and watchdog fallback.',
    procedure: 'Command LWT setpoint adjustment from central BMS workstation and verify automatic revert to Local Mode upon simulated network disconnect.',
    manualRef: 'D-EIMBM01104-22_04EN · Sec 5.2 (p.37)',
    safetyHold: 'Ensure local hardware E-Stop overrides BMS command at all times.',
  },
  {
    stepNumber: 12,
    title: 'Commissioning Documentation Compilation',
    objective: 'Generate complete signed commissioning log sheets, approach calculations, and parameter backup.',
    procedure: 'Export MicroTech configuration backup and compile signed test sheets into the O&M Handover Manual.',
    manualRef: 'D-EIMAC01405-21_04EN · Sec 9.1 (p.63)',
    safetyHold: 'Software-generated logs support documentation and do not replace authorized factory warranty sign-off.',
  },
  {
    stepNumber: 13,
    title: 'Client Demonstration and Handover',
    objective: 'Train client facility operations team on daily log readings, strainer cleaning, alarm reset rules, and escalation contacts.',
    procedure: 'Conduct plantroom walkthrough covering normal operating parameters, LOTO isolation points, and preventive maintenance schedule.',
    manualRef: 'D-EIMAC01405-21_04EN · Sec 9.2 (p.65)',
    safetyHold: 'Remind operators that refrigerant and internal VFD servicing is restricted to certified technicians.',
  },
];

export interface VerifiedErrorCode {
  id: string;
  code: string;
  officialDescription: string;
  equipmentCategory: string;
  applicableModels: string[];
  controllerType: string;
  symptoms: string;
  possibleCauses: string[];
  safeDiagnosticChecks: string[];
  requiredMeasurements: string[];
  correctiveActionGuidance: string[];
  escalationRequirements: string;
  manualReference: string;
}

export const VERIFIED_ERROR_CODES: VerifiedErrorCode[] = [
  {
    id: 'err_u0',
    code: 'U0',
    officialDescription: 'Refrigerant Shortage / Low Pressure Drop Warning or Fault',
    equipmentCategory: 'Daikin VRV / VRF Systems',
    applicableModels: ['REYQ16T', 'RXYQ18T', 'RZASG125MV1'],
    controllerType: 'DIII-Net / BRC1E53A / 7-Segment Outdoor PCB',
    symptoms: 'System stops or derates capacity; poor cooling/heating performance; high discharge superheat.',
    possibleCauses: [
      'Liquid or gas stop valve on outdoor unit left partially or fully closed after installation',
      'Actual refrigerant leak at flare connection, REFNET brazed joint, or indoor coil',
      'Clogged liquid line filter-drier or Electronic Expansion Valve (EV) stuck closed due to oxide scale',
      'Faulty low-pressure sensor (S1NPL) or suction thermistor (R3T)',
    ],
    safeDiagnosticChecks: [
      'Verify liquid, gas, and equalizing stop valves on outdoor unit(s) are 100% open',
      'Inspect all flare nuts and REFNET joints for oil traces before connecting gauges',
      'Check outdoor PCB service monitor mode for low-pressure sensor reading vs manifold gauge',
      'Verify indoor/outdoor EV coil continuity and stepping sound on power reset',
    ],
    requiredMeasurements: [
      'Suction gauge pressure (MPa) vs S1NPL sensor telemetry on Mode 2',
      'Compressor discharge temperature (R21T/R22T) and suction superheat (K)',
      'EV winding resistance across pins (150–500 Ohm per phase)',
    ],
    correctiveActionGuidance: [
      'If stop valve was closed, open fully and verify system pressures equalize',
      'If leak is suspected, recover remaining refrigerant into certified recovery cylinder, perform 3-stage nitrogen pressure test (up to 4.0 MPa per IOM), repair leak with nitrogen purge, triple evacuate (<500 microns), and weigh in exact nameplate + piping charge',
    ],
    escalationRequirements:
      'Escalate to Authorized Daikin Service if compressor discharge temperature exceeded 115°C or if internal outdoor subcooling EV / inverter compressor damage is suspected.',
    manualReference: 'Daikin VRV IV Service Manual D-EIMVRV0418-21_05EN · Section 9.2 (Pages 88–90)',
  },
  {
    id: 'err_u2',
    code: 'U2',
    officialDescription: 'Power Supply Insufficient Voltage / Inverter DC Bus Over- or Under-Voltage',
    equipmentCategory: 'Daikin VRV / VRF Systems',
    applicableModels: ['REYQ16T', 'RXYQ18T'],
    controllerType: 'DIII-Net / Inverter PCB (A2P)',
    symptoms: 'Outdoor unit trips shortly after compressor start or during high-load ramp up.',
    possibleCauses: [
      'Incoming 3-phase supply voltage drop below 342V AC or open phase (L1, L2, or L3)',
      'Phase voltage imbalance exceeding 2% across L1-L2-L3 terminals (X1M)',
      'Loose power lug termination at outdoor isolator or main terminal block causing voltage sag under load',
      'Defective Inverter PCB (A2P) DC bus electrolytic capacitor or converter diode bridge',
    ],
    safeDiagnosticChecks: [
      'Perform LOTO, wait 15 minutes for DC bus discharge (<20V DC), and inspect X1M power terminals for overheating or loose torque',
      'Verify incoming breaker and isolator contacts have zero pitting or high contact resistance',
    ],
    requiredMeasurements: [
      'Line-to-line voltage L1-L2, L2-L3, L3-L1 at standby AND during compressor start-up load',
      'Phase voltage imbalance % = (Max deviation from average voltage / Average voltage) x 100 (Must be < 2%)',
      'Inverter DC bus voltage (P-N) in service monitor mode (nominal ~510–560V DC on 400V AC supply)',
    ],
    correctiveActionGuidance: [
      'Rectify building feeder voltage drop, loose power connections, or open phase fuse',
      'If incoming 3-phase supply is stable within 400V ±10% and <2% imbalance under load, inspect noise filter PCB and inverter PCB',
    ],
    escalationRequirements:
      'Escalate to Authorized Daikin Service for Inverter PCB (A2P) IGBT/diode check and replacement.',
    manualReference: 'Daikin VRV IV Service Manual D-EIMVRV0418-21_05EN · Section 9.3 (Pages 91–93)',
  },
  {
    id: 'err_u4',
    code: 'U4',
    officialDescription: 'Transmission Malfunction Between Indoor Units and Outdoor Unit (F1-F2 Bus)',
    equipmentCategory: 'Daikin VRV / VRF Systems',
    applicableModels: ['REYQ16T', 'RXYQ18T', 'FXFQ100A', 'BSVQ100PV1'],
    controllerType: 'DIII-Net / BRC1E53A Wired Controller',
    symptoms: 'Wired remote controller flashes U4; indoor units do not respond to outdoor unit.',
    possibleCauses: [
      'Outdoor unit power supply is turned OFF while indoor units remain powered ON (or vice versa)',
      'Short circuit, open wire, or multi-core cable used on F1-F2 transmission wiring instead of 2-core stranded cable',
      'F1-F2 communication cable routed inside same conduit as high-voltage 400V/230V power cables causing EMI noise',
      'Incorrect outdoor-to-outdoor Q1-Q2 vs indoor-to-outdoor F1-F2 terminal cross-wiring',
    ],
    safeDiagnosticChecks: [
      'Confirm power breakers for ALL indoor units, BS boxes, and outdoor units on the DIII-Net loop are turned ON simultaneously',
      'Inspect F1-F2 terminal block on outdoor main PCB (A1P) for correct 2-core 0.75–1.25 mm2 wiring',
      'Disconnect F1-F2 bus at outdoor unit and measure whether 16V DC pulse is generated by outdoor A1P PCB',
    ],
    requiredMeasurements: [
      'DC voltage across outdoor F1-F2 terminals (normal: fluctuating 14.0V to 18.0V DC)',
      'Loop continuity and insulation resistance between F1, F2, and Earth (with cables disconnected from PCBs!)',
    ],
    correctiveActionGuidance: [
      'Restore power to any de-energized indoor/BS/outdoor unit on the shared refrigerant/communication loop',
      'Repair open/shorted F1-F2 segment and press BS3 (Reset) button on outdoor main PCB for 5 seconds to re-initialize bus address count',
    ],
    escalationRequirements:
      'Escalate to Authorized Daikin Service if outdoor main PCB (A1P) outputs 0V DC on F1-F2 with external bus disconnected.',
    manualReference: 'Daikin VRV IV Service Manual D-EIMVRV0418-21_05EN · Section 9.5 (Pages 96–98)',
  },
  {
    id: 'err_e3',
    code: 'E3',
    officialDescription: 'Actuation of High Pressure Switch (S1PH) / Abnormal Discharge Pressure',
    equipmentCategory: 'Daikin VRV / VRF Systems',
    applicableModels: ['REYQ16T', 'RXYQ18T'],
    controllerType: 'DIII-Net / Outdoor Main PCB (A1P)',
    symptoms: 'Immediate system trip on high pressure (>4.0 MPa); outdoor condenser fans running at max speed.',
    possibleCauses: [
      'Outdoor unit gas/liquid stop valves closed during operation',
      'Dirty/blocked outdoor condenser coil fins or hot air recirculation due to insufficient clearance',
      'Outdoor condenser fan motor fault or airflow obstruction in cooling mode',
      'Refrigerant overcharge or non-condensable air in system due to improper evacuation',
      'Disconnected S1PH high-pressure switch harness on outdoor PCB',
    ],
    safeDiagnosticChecks: [
      'Check outdoor condenser coil cleanliness and verify airflow path is unobstructed',
      'Verify stop valves are fully open',
      'Check S1PH high pressure switch continuity after system pressure drops below 3.0 MPa',
    ],
    requiredMeasurements: [
      'High-pressure sensor reading vs calibrated manifold gauge (Trip threshold: 4.0 MPa / 40 bar)',
      'Liquid subcooling temperature at condenser outlet',
      'Continuity across S1PH connector when pressure < 2.9 MPa',
    ],
    correctiveActionGuidance: [
      'Clean condenser coil with low-pressure water wash in reverse airflow direction',
      'Verify outdoor fan rotation and remove any duct/louver restriction on condenser discharge',
    ],
    escalationRequirements:
      'Escalate to Authorized Daikin Service if refrigerant recovery/weigh-in verification or high-pressure switch replacement is required.',
    manualReference: 'Daikin VRV IV Service Manual D-EIMVRV0418-21_05EN · Section 9.1 (Pages 82–84)',
  },
  {
    id: 'err_l5',
    code: 'L5',
    officialDescription: 'Inverter Compressor Instantaneous Overcurrent (DC Output Overcurrent)',
    equipmentCategory: 'Daikin VRV / VRF Systems',
    applicableModels: ['REYQ16T', 'RXYQ18T'],
    controllerType: 'DIII-Net / Inverter PCB (A2P)',
    symptoms: 'Compressor attempts to start and trips within seconds with L5 code.',
    possibleCauses: [
      'Liquid stop valve closed or excessive differential pressure across compressor at start-up',
      'Compressor motor winding ground fault, short-circuit, or mechanical rotor lock',
      'Inverter PCB (A2P) IPM (Intelligent Power Module) transistor fault',
    ],
    safeDiagnosticChecks: [
      'Perform LOTO and wait 15 minutes for capacitor discharge before disconnecting U-V-W compressor leads',
      'Connect Daikin Inverter Checker module to U-V-W output terminals of A2P PCB to isolate PCB vs Compressor fault',
    ],
    requiredMeasurements: [
      'Compressor U-V, V-W, W-U winding resistance balance (must be balanced within ±5%)',
      'Compressor winding-to-earth insulation resistance (500V DC Megger on motor leads ONLY — NEVER Megger the Inverter PCB!)',
    ],
    correctiveActionGuidance: [
      'If Inverter Checker LED sequence fails, replace Inverter PCB (A2P)',
      'If Inverter Checker passes and compressor winding is grounded/locked, compressor replacement by certified factory team is required',
    ],
    escalationRequirements:
      'Mandatory Escalation to Authorized Daikin Service for inverter compressor or IPM module replacement.',
    manualReference: 'Daikin VRV IV Service Manual D-EIMVRV0418-21_05EN · Section 9.8 (Pages 104–106)',
  },
  {
    id: 'err_mt_flow',
    code: 'ALM-FLOW / E-EVAP-FLOW',
    officialDescription: 'Evaporator Water Flow Loss / Flow Switch Interlock Open',
    equipmentCategory: 'Daikin Air-Cooled Chillers',
    applicableModels: ['EWAD-TZ-B', 'EWAD-C-SS', 'EWWD-VZ'],
    controllerType: 'MicroTech III / MicroTech IV',
    symptoms: 'Chiller refuses to start ("Waiting for Flow") or trips immediately during operation with Evaporator Water Flow Fault.',
    possibleCauses: [
      'Chilled-water primary pump not running, air-bound, or rotating in reverse',
      'Clogged 1.0 mm mesh Y-strainer at evaporator water inlet restricting flow below minimum threshold',
      'Motorized chiller isolation butterfly valve failed to open or end-switch fault',
      'Air pocket trapped at top of evaporator piping where thermal dispersion / paddle flow switch is mounted',
      'Flow switch installed too close (<5D) to pipe elbow causing turbulent false trips',
    ],
    safeDiagnosticChecks: [
      'Verify primary CHW pump status and check differential pressure across evaporator inlet/outlet gauges',
      'Bleed air from evaporator top air vent valve until solid water stream flows',
      'Inspect Y-strainer pressure drop (if > 30 kPa clean delta, isolate and clean strainer basket)',
      'Verify flow switch straight-pipe location (>= 5D upstream and downstream)',
    ],
    requiredMeasurements: [
      'Evaporator Entering vs Leaving Water Pressure Drop (kPa) compared against IOM hydraulic curve',
      'Ultrasonic / PICV measured water flow rate (L/s) vs minimum allowable evaporator flow',
      'Continuity across flow switch digital input terminals at MicroTech panel',
    ],
    correctiveActionGuidance: [
      'Clean clogged inlet strainer basket and purge entrained air from hydronic loop',
      'Verify pump VFD minimum speed setting is above chiller minimum flow requirement',
      'NEVER jumper or bypass the flow switch terminals under any circumstances',
    ],
    escalationRequirements:
      'Escalate to Authorized Daikin Service if flow switch contact fails when verified hydraulic flow is at 100% nominal design.',
    manualReference: 'Daikin EWAD-TZ-B IOM D-EIMAC01405-21_04EN · Sections 4.4 & 8.1 (Pages 31, 59)',
  },
  {
    id: 'err_mt_low_evap',
    code: 'ALM-LOW-EVAP / LP-TRIP',
    officialDescription: 'Low Evaporator Refrigerant Pressure / Freeze Protection Cutout',
    equipmentCategory: 'Daikin Air-Cooled Chillers',
    applicableModels: ['EWAD-TZ-B', 'EWWD-VZ'],
    controllerType: 'MicroTech III / MicroTech IV',
    symptoms: 'Circuit trips on Low Evaporator Pressure; evaporator approach temperature elevated (>3.5 K).',
    possibleCauses: [
      'Insufficient chilled-water flow rate across evaporator or rapidly falling entering water temperature',
      'Evaporator tube internal fouling or laminar flow due to missing glycol in low-temperature application',
      'Electronic Expansion Valve (EXV) hunting or liquid line filter-drier restriction (high temperature drop across drier)',
      'Refrigerant undercharge or suction pressure transducer calibration drift',
    ],
    safeDiagnosticChecks: [
      'Verify evaporator water flow rate (L/s) and Leaving Chilled Water Temperature (LWT) setpoint (>= +4.0°C for plain water)',
      'Calculate Evaporator Approach = LWT (°C) minus Saturated Suction Temperature (°C)',
      'Measure temperature drop across liquid line filter-drier (> 2 K drop indicates restriction)',
    ],
    requiredMeasurements: [
      'Evaporator Entering & Leaving Water Temperatures (°C) and Delta-T (K)',
      'Suction pressure transducer reading (kPa/bar) vs calibrated reference gauge',
      'Evaporator Approach Temperature (K) and Suction Superheat (K)',
    ],
    correctiveActionGuidance: [
      'Restore nominal chilled water flow rate and verify LWT setpoint matches approved design',
      'If evaporator approach is high (>3.5 K) at normal water flow and normal subcooling, schedule heat exchanger cleaning',
    ],
    escalationRequirements:
      'Escalate to Authorized Daikin Service for refrigerant circuit servicing, filter-drier core replacement, or EXV calibration.',
    manualReference: 'Daikin EWWD-VZ / EWAD-TZ Service Manual D-EIMWC01203-19_02EN · Section 6.2 (Page 49)',
  },
];

export interface VideoSimulationModule {
  id: string;
  title: string;
  category: string;
  modelNumber: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  isConceptualNotice: string;
  manualReference: string;
  chapters: { time: string; title: string; summaryEn: string; summaryAr: string }[];
  notesSummary: string;
}

export const VIDEO_SIMULATION_MODULES: VideoSimulationModule[] = [
  {
    id: 'sim_chiller_hydronic',
    title: 'Interactive Chiller Hydronic Loop, Approach & Flow Switch Lab',
    category: 'Daikin Air-Cooled & Water-Cooled Chillers',
    modelNumber: 'EWAD-TZ-B / EWWD-VZ',
    duration: '18:40',
    level: 'Intermediate',
    isConceptualNotice:
      'Educational Thermodynamic & Hydronic Simulation grounded in Daikin IOM D-EIMAC01405-21_04EN & D-EIMWC01203-19_02EN. Interactive simulator demonstrates real-time Evaporator Delta-T, Approach Temperature, and Flow Switch Interlock behavior.',
    manualReference: 'D-EIMAC01405-21_04EN · Sec 4.4 & D-EIMWC01203-19_02EN · Sec 6.2',
    chapters: [
      {
        time: '00:00',
        title: '01. Evaporator Counter-Flow & 1.0 mm Strainer Verification',
        summaryEn:
          'Verify chilled-water enters the bottom evaporator connection through a clean <=1.0 mm mesh strainer and exits through the top outlet connection.',
        summaryAr:
          'التحقق من دخول الماء المبرد إلى المبخر عبر مصفاة شبكية (<= 1.0 مم) وخروجه من الوصلة العلوية مع ضمان التدفق العكسي السليم.',
      },
      {
        time: '04:30',
        title: '02. Flow Switch 5D Straight-Run & Hardwired Safety Trip',
        summaryEn:
          'Install the flow switch on the evaporator outlet with minimum 5 pipe diameters upstream and downstream. Observe how dropping flow below 75% triggers an immediate MicroTech safety lockout.',
        summaryAr:
          'تركيب مفتاح التدفق على مخرج المبخر مع مسافة مستقيمة لا تقل عن 5 أضعاف قطر الأنبوب، ومراقبة الفصل الآمن الفوري عند انخفاض التدفق.',
      },
      {
        time: '10:15',
        title: '03. Evaporator & Condenser Approach Temperature Diagnostics',
        summaryEn:
          'Calculate Evaporator Approach (LWT - SST) and Condenser Approach (SDT - LCWT). Identify how fouling or reduced water flow shifts saturation temperatures.',
        summaryAr:
          'حساب فرق حرارة التقارب للمبخر والمكثف وتشخيص تكلس الأنابيب أو نقص تدفق المياه بأمان.',
      },
      {
        time: '15:00',
        title: '04. 12-Hour Crankcase Heater & Soft Inverter Ramp-Up',
        summaryEn:
          'Confirm compressor oil sump superheat before enabling Local Start and observe smooth VFD frequency modulation.',
        summaryAr:
          'التأكد من تشغيل سخان الزيت لمدة 12 ساعة على الأقل قبل بدء التشغيل ومراقبة التدرج الآمن لعاكس التردد.',
      },
    ],
    notesSummary: `KEY ENGINEERING FORMULAS & VERIFIED CHECKS:
• Cooling Capacity Q (kW) = Flow (L/s) × 4.186 × (EWT - LWT)
• Evaporator Approach (K) = Leaving Chilled Water Temp (LWT) - Saturated Suction Temp (SST) [Nominal: 1.0–2.5 K]
• Condenser Approach (K) = Saturated Discharge Temp (SDT) - Leaving Condenser Water Temp (LCWT) [Nominal: 1.0–3.0 K]
• Flow Switch Rule: Minimum 5D straight pipe upstream & downstream; hardwired to MicroTech safety interlock input.`,
  },
  {
    id: 'sim_vrv_commissioning',
    title: 'VRV IV / V Nitrogen Brazing, 3-Stage Pressure Test & Triple Evacuation',
    category: 'Daikin VRV / VRF Systems',
    modelNumber: 'REYQ16T / FXFQ100A',
    duration: '22:15',
    level: 'Advanced',
    isConceptualNotice:
      'Step-by-step procedural animation based on Daikin VRV IV Installation Manual D-EIMVRV0418-21_05EN. Demonstrates internal copper oxide prevention, 4.0 MPa pressure hold temperature compensation, and <500 micron vacuum verification.',
    manualReference: 'D-EIMVRV0418-21_05EN · Sec 4.1, 5.3 & 5.4 (Pages 22–54)',
    chapters: [
      {
        time: '00:00',
        title: '01. Dry Nitrogen Purge During Brazing (0.02 MPa)',
        summaryEn:
          'Regulate oxygen-free dry nitrogen to 0.02 MPa continuous flow while brazing REFNET joints to prevent copper oxide film inside EVs.',
        summaryAr:
          'ضبط تدفق النيتروجين الجاف الخالي من الأكسجين عند 0.02 ميجا باسكال أثناء اللحام لمنع تكون أكاسيد النحاس داخل صمامات التمدد.',
      },
      {
        time: '06:20',
        title: '02. Three-Stage Nitrogen Pressure Test (0.3 -> 1.5 -> 4.0 MPa)',
        summaryEn:
          'Pressurize in 3 stages up to 4.0 MPa for 24 hours. Apply ±0.01 MPa per 1°C ambient temperature change correction.',
        summaryAr:
          'اختبار ضغط النيتروجين على 3 مراحل حتى 4.0 ميجا باسكال لمدة 24 ساعة مع تطبيق معامل تصحيح درجة الحرارة المحيطة.',
      },
      {
        time: '13:45',
        title: '03. Deep Vacuum Evacuation (< 500 Microns / -100.7 kPa)',
        summaryEn:
          'Evacuate liquid and gas lines simultaneously with digital micron gauge below 500 microns and perform 1-hour standing rise test.',
        summaryAr:
          'التفريغ العميق لخطوط السائل والغاز معاً لأقل من 500 ميكرون وإجراء اختبار ثبات الفراغ لمدة ساعة.',
      },
      {
        time: '18:30',
        title: '04. Additional Refrigerant Charge Calculation & DIII-Net Auto Test Run',
        summaryEn:
          'Calculate liquid pipe length charge weight, weigh in liquid R-410A with compressor OFF, then open stop valves and initiate Mode 2 test run.',
        summaryAr:
          'حساب شحنة الفريون الإضافية حسب أطوال وأقطار أنابيب السائل وشحنها بالوزن قبل فتح الصمامات وتشغيل الاختبار الآلي.',
      },
    ],
    notesSummary: `VERIFIED VRV IV COMMISSIONING PARAMETERS (D-EIMVRV0418-21_05EN):
• Nitrogen Brazing Purge Pressure: 0.02 MPa (0.2 bar) continuous flow
• Pressure Test Stages: Stage 1 = 0.3 MPa (3 min) | Stage 2 = 1.5 MPa (5 min) | Stage 3 = 4.0 MPa (24 hours)
• Temperature Correction: ΔP = (T_final - T_initial) × 0.01 MPa
• Vacuum Target: <= 500 microns (-100.7 kPa gauge) held for >= 1 hour`,
  },
];

export interface PracticalScenario {
  id: string;
  title: string;
  modelNumber: string;
  difficulty: 'Intermediate' | 'Advanced';
  prompt: string;
  manualReference: string;
  expectedCriteria: string;
  hint: string;
}

export const PRACTICAL_SCENARIOS: PracticalScenario[] = [
  {
    id: 'scen_01',
    title: 'Chiller Leaving Water Temperature Not Reaching Setpoint',
    modelNumber: 'EWAD-TZ-B (MicroTech IV)',
    difficulty: 'Intermediate',
    prompt:
      'A Daikin EWAD-TZ-B air-cooled screw chiller is operating continuously, but the Leaving Chilled-Water Temperature (LWT) is stuck at +10.8°C instead of reaching the +7.0°C setpoint. Identify which safe, non-invasive checks and measurements should be completed first before suspecting a refrigerant fault.',
    manualReference: 'Daikin EWAD-TZ-B IOM D-EIMAC01405-21_04EN · Sections 3.4, 4.4, 4.5 & 7.3',
    expectedCriteria:
      '1. Verify active LWT setpoint and check if Demand Limit / Network Current Limit or LWT Reset is active on MicroTech IV. 2. Measure Entering Water Temperature (EWT), Leaving Water Temperature (LWT), and evaporator water flow rate (L/s) or evaporator Delta-P to determine if actual building cooling load exceeds nominal chiller capacity or if water flow is excessive/bypassing. 3. Check ambient dry-bulb temperature and inspect condenser coils/fans for airflow restriction or hot-air recirculation. 4. Compare LWT vs Saturated Suction Temperature (Evaporator Approach) and check active alarms without bypassing any safety devices.',
    hint: 'Consider controller demand limits, actual hydronic heat load Q = m × Cp × (EWT - LWT), condenser airflow clearance, and evaporator approach temperature.',
  },
  {
    id: 'scen_02',
    title: 'FAHU Abnormal Casing Vibration After Initial Start-Up',
    modelNumber: 'DPS-FAHU-100',
    difficulty: 'Intermediate',
    prompt:
      'During pre-commissioning start-up of a newly installed Daikin DPS-FAHU-100 Fresh Air Handling Unit, you observe severe low-frequency vibration transmitted to the plantroom floor and ductwork. List the safe step-by-step inspection sequence to isolate and resolve the root cause.',
    manualReference: 'Daikin Modular AHU/FAHU IOM D-EIMAH00108-22_01EN · Sections 3.5 & 7.1',
    expectedCriteria:
      '1. Immediately stop the FAHU and perform Lockout/Tagout (LOTO), waiting for fans and heat wheel to come to a complete stop before opening access doors. 2. Check internal fan assembly spring isolators to verify ALL red/yellow painted factory transit/shipping locking brackets have been removed. 3. Inspect flexible canvas duct connections at supply/exhaust spigots to ensure they are not stretched taut. 4. Rotate fan impeller by hand to check for foreign construction debris, balance weight loss, or bearing rub, and inspect enthalpy heat recovery wheel belt tension and alignment.',
    hint: 'Always begin with safe isolation (LOTO), then check the #1 most common post-delivery cause of AHU fan vibration in Section 3.5 of the IOM.',
  },
  {
    id: 'scen_03',
    title: 'VRV IV System Showing U4 Transmission Fault Across All Indoor Units',
    modelNumber: 'REYQ16T + 12x FXFQ100A',
    difficulty: 'Advanced',
    prompt:
      'Following a weekend electrical shutdown, a Daikin REYQ16T VRV IV system displays Error Code U4 on all wired remote controllers (BRC1E53A). Detail your safe diagnostic procedure and the exact electrical measurements required to isolate the fault.',
    manualReference: 'Daikin VRV IV Service Manual D-EIMVRV0418-21_05EN · Section 6.4 & 9.5 (Pages 67, 96–98)',
    expectedCriteria:
      '1. Verify power supply breakers are ON for the outdoor unit REYQ16T, all Branch Selector (BS) boxes, and all 12 FXFQ100A indoor units. 2. Inspect outdoor main PCB (A1P) 7-segment display and measure DC voltage across F1-F2 communication terminals (normal: 14–18V DC pulsing). 3. If F1-F2 voltage is 0V or unstable, perform LOTO, disconnect the external F1-F2 field wire from the outdoor A1P board, re-energize outdoor unit, and measure F1-F2 on the PCB alone to isolate an external field wiring short vs an outdoor A1P PCB failure. 4. If field wiring is shorted, check 2-core shielded wire continuity, separation from high-voltage power lines (>=50 mm), and press BS3 reset for 5s after repair.',
    hint: 'Check outdoor unit power state first, then isolate the outdoor PCB F1-F2 output (14–18V DC) from the external field bus.',
  },
];

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  manualRef: string;
}

export interface AcademyCourse {
  id: string;
  title: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  requiredPlan: 'free' | 'pro' | 'premium';
  duration: string;
  manualCode: string;
  objectives: string[];
  questions: QuizQuestion[];
}

export const ACADEMY_COURSES: AcademyCourse[] = [
  {
    id: 'course_chiller_fundamentals',
    title: 'Daikin Air-Cooled Screw Chiller Installation & Pre-Commissioning Certification',
    category: 'Daikin Air-Cooled Chillers',
    level: 'Beginner',
    requiredPlan: 'free',
    duration: '3 Hours',
    manualCode: 'D-EIMAC01405-21_04EN',
    objectives: [
      'Verify foundation levelness, service clearances, and anti-vibration isolator placement per EWAD-TZ-B IOM',
      'Identify mandatory hydronic components including <=1.0 mm mesh strainer and 5D flow switch straight run',
      'Apply electrical phase balance (<2%) and 12-hour crankcase heater pre-heat rules prior to start-up',
    ],
    questions: [
      {
        id: 'q1',
        question:
          'According to Daikin EWAD-TZ-B Installation Manual (D-EIMAC01405-21_04EN), what is the maximum allowable mesh perforation size for the mechanical water strainer installed upstream of the evaporator inlet?',
        options: ['3.0 mm mesh', '1.0 mm mesh', '5.0 mm mesh', 'Strainer is optional on closed loops'],
        correctIndex: 1,
        explanation:
          'Section 4.4 (p.31) mandates a mechanical mesh strainer with a maximum mesh size of 1.0 mm directly upstream of the evaporator water inlet to prevent tube fouling and freeze damage.',
        manualRef: 'D-EIMAC01405-21_04EN · Sec 4.4 (p.31)',
      },
      {
        id: 'q2',
        question:
          'What is the minimum required straight-pipe run upstream and downstream of the chilled-water flow switch on the evaporator outlet?',
        options: [
          '1 pipe diameter (1D)',
          '2 pipe diameters (2D)',
          '5 pipe diameters (5D)',
          'Can be mounted directly on a 90° elbow',
        ],
        correctIndex: 2,
        explanation:
          'Section 4.4 requires a minimum of 5 pipe diameters (5D) of straight pipe upstream and downstream of the flow switch to ensure stable laminar velocity profile and reliable flow-loss detection.',
        manualRef: 'D-EIMAC01405-21_04EN · Sec 4.4 (p.31)',
      },
      {
        id: 'q3',
        question:
          'Before initial compressor start-up on an EWAD-TZ-B or EWWD-VZ chiller, how long must the compressor crankcase/oil heater be energized, and what is the maximum allowable phase voltage imbalance?',
        options: [
          '1 hour pre-heat; 5% voltage imbalance',
          '12 hours minimum pre-heat; 2% maximum phase voltage imbalance',
          '30 minutes pre-heat; 10% voltage imbalance',
          'Pre-heat is not required on screw compressors',
        ],
        correctIndex: 1,
        explanation:
          'Section 5.1 (p.42) specifies energizing crankcase heaters at least 12 hours prior to start-up to boil off liquid refrigerant from the oil, and requires phase voltage imbalance to remain within 2%.',
        manualRef: 'D-EIMAC01405-21_04EN · Sec 5.1 (p.42)',
      },
      {
        id: 'q4',
        question:
          'After isolating main 3-phase power on an inverter chiller (EWAD-TZ-B / EWWD-VZ), what safety precaution is required before touching internal VFD busbars or inverter PCB components?',
        options: [
          'Open the panel and work immediately',
          'Wait at least 15 minutes for DC bus capacitors to discharge and verify < 20V DC with a rated multimeter',
          'Perform a 500V DC Megger test directly across the inverter IGBT terminals',
          'Bypass the door interlock switch',
        ],
        correctIndex: 1,
        explanation:
          'Safety Section mandates full LOTO and waiting at least 15 minutes for inverter DC link capacitors to discharge below 20V DC, verified with a calibrated multimeter.',
        manualRef: 'D-EIMAC01405-21_04EN · Safety Precautions (p.4)',
      },
    ],
  },
  {
    id: 'course_vrv_mastery',
    title: 'Daikin VRV IV / V Refrigerant Piping, Evacuation & DIII-Net Diagnostics',
    category: 'Daikin VRV / VRF Systems',
    level: 'Intermediate',
    requiredPlan: 'pro',
    duration: '4.5 Hours',
    manualCode: 'D-EIMVRV0418-21_05EN',
    objectives: [
      'Execute oxygen-free nitrogen purging (0.02 MPa) and horizontal REFNET joint alignment (±15°)',
      'Conduct 3-stage nitrogen pressure testing up to 4.0 MPa with ambient temperature compensation',
      'Perform deep vacuum evacuation below 500 microns and troubleshoot U0, U2, U4, E3, and L5 error codes',
    ],
    questions: [
      {
        id: 'vq1',
        question:
          'When brazing copper refrigerant piping and REFNET joints on a Daikin VRV IV system, what gas and pressure must be continuously purged through the pipe?',
        options: [
          'Compressed shop air at 2.0 bar',
          'Oxygen-free dry nitrogen at 0.02 MPa (0.2 bar)',
          'R-410A refrigerant vapor at 0.5 MPa',
          'Carbon dioxide at 5.0 bar',
        ],
        correctIndex: 1,
        explanation:
          'Section 4.1 (p.22) requires continuous purging of oxygen-free dry nitrogen regulated to 0.02 MPa (0.2 bar) during brazing to prevent internal copper oxide scale that blocks Electronic Expansion Valves (EVs).',
        manualRef: 'D-EIMVRV0418-21_05EN · Sec 4.1 (p.22)',
      },
      {
        id: 'vq2',
        question:
          'During the 24-hour Stage 3 nitrogen pressure test at 4.0 MPa on a REYQ16T system, the ambient temperature drops by 5°C overnight. What pressure change corresponds to normal thermal contraction?',
        options: [
          '0.05 MPa drop (±0.01 MPa per 1°C change)',
          '0.50 MPa drop',
          'Pressure never changes with ambient temperature',
          '1.0 MPa drop',
        ],
        correctIndex: 0,
        explanation:
          'Section 5.3 (p.48) specifies an ambient temperature pressure correction factor of ±0.01 MPa per 1°C change. A 5°C drop results in a normal 0.05 MPa gauge pressure decrease when no leak is present.',
        manualRef: 'D-EIMVRV0418-21_05EN · Sec 5.3 (p.48)',
      },
      {
        id: 'vq3',
        question:
          'What is the required deep vacuum evacuation threshold and wiring specification for DIII-Net F1-F2 communication on Daikin VRV IV?',
        options: [
          'Vacuum below 500 microns (-100.7 kPa); 2-core stranded non-polar cable (0.75–1.25 mm2) separated >=50 mm from power lines',
          'Vacuum for 10 minutes without gauge; 4-core solid cat5 cable bundled with 400V feeder',
          'Purge lines with refrigerant instead of vacuum pump',
          'Vacuum to -50 kPa only on gas pipe',
        ],
        correctIndex: 0,
        explanation:
          'Sections 5.4 & 6.4 require simultaneous liquid/gas evacuation below 500 microns (-100.7 kPa) held for >=1 hour, and 2-core 0.75–1.25 mm2 F1-F2 communication cable separated from high-voltage power cables.',
        manualRef: 'D-EIMVRV0418-21_05EN · Sec 5.4 & 6.4 (p.52, 67)',
      },
    ],
  },
  {
    id: 'course_bms_commissioning',
    title: 'Advanced Water-Cooled Chiller Commissioning, Approach Analysis & BMS Integration',
    category: 'Daikin Controls and BMS Integration',
    level: 'Advanced',
    requiredPlan: 'premium',
    duration: '5 Hours',
    manualCode: 'D-EIMBM01104-22_04EN & D-EIMWC01203-19_02EN',
    objectives: [
      'Evaluate Evaporator Approach and Condenser Approach temperatures at full load on EWWD-VZ chillers',
      'Configure BACnet MS/TP and Modbus RTU RS-485 daisy-chain termination, baud rate, and watchdog fail-safe',
      'Audit central plant safety interlocks between motorized isolation valves, primary pumps, flow switches, and chillers',
    ],
    questions: [
      {
        id: 'bq1',
        question:
          'On a Daikin EWWD-VZ water-cooled chiller operating at 100% load with Leaving Condenser Water Temp = 35.0°C and Saturated Discharge Temp = 41.2°C (Condenser Approach = 6.2 K), what is the primary diagnostic conclusion?',
        options: [
          'Normal clean condenser operation',
          'Elevated Condenser Approach (>4.0 K) indicating condenser tube fouling/scaling or non-condensables in the refrigerant circuit',
          'Evaporator freeze protection fault',
          'Chilled water flow rate is too high',
        ],
        correctIndex: 1,
        explanation:
          'Per D-EIMWC01203-19_02EN Section 6.2 (p.49), normal Condenser Approach at full load is 1.0 K to 3.0 K. A reading of 6.2 K (>4.0 K) indicates heat transfer impedance across the condenser tubes (fouling/scale) or non-condensable gases.',
        manualRef: 'D-EIMWC01203-19_02EN · Sec 6.2 (p.49)',
      },
      {
        id: 'bq2',
        question:
          'Where must the 120-Ohm End-of-Line (EOL) termination resistors be enabled on a BACnet MS/TP or Modbus RTU RS-485 communication trunk?',
        options: [
          'On every single chiller and FCU controller along the bus',
          'ONLY at the two physical ends of the daisy-chained RS-485 trunk cable',
          'Nowhere; RS-485 does not use termination resistors',
          'Between F1 and Earth ground on every controller',
        ],
        correctIndex: 1,
        explanation:
          'Per D-EIMBM01104-22_04EN Section 3.4 (p.19), 120-Ohm EOL termination must be enabled strictly at the two physical ends of the RS-485 daisy chain to prevent signal reflections without overloading the transceivers.',
        manualRef: 'D-EIMBM01104-22_04EN · Sec 3.4 (p.19)',
      },
      {
        id: 'bq3',
        question:
          'How must hardwired safety interlocks (Evaporator Water Flow Switch, High Pressure Cutout, Emergency Stop) be integrated when a Daikin chiller is controlled via BMS Network Mode?',
        options: [
          'They can be replaced by software BACnet points to save field wiring',
          'They must remain hardwired directly to the chiller MicroTech safety terminals at all times and never rely solely on software BMS commands',
          'They are disabled automatically when Network Mode is selected',
          'They only apply during manual commissioning',
        ],
        correctIndex: 1,
        explanation:
          'Section 5.2 (p.37) strictly mandates that all life-safety and equipment-protection interlocks (Flow Switch, HP cutout, E-Stop) remain hardwired to the unit controller regardless of BMS Network Mode.',
        manualRef: 'D-EIMBM01104-22_04EN · Sec 5.2 (p.37)',
      },
    ],
  },
];
