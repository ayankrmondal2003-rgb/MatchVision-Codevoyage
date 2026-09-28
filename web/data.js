/**
 * MatchVision - Match Dataset & Computer Vision Analytics Data
 * Matches the MatchVision schema (v2.3)
 */
const MATCH_DATA = {
  schema_version: "2.3",
  analysis_id: "mv-run-20260926-8842",
  status: "completed",
  match: {
    title: "Arsenal vs Manchester City",
    competition: "Premier League - Matchday 28",
    venue: "Emirates Stadium",
    date: "2026-09-26",
    fps: 25,
    duration_seconds: 28.5,
    frame_count: 712,
    team_1: {
      id: 1,
      name: "Arsenal",
      short_name: "ARS",
      color: "#00FF87", // Neon Green / Primary
      color_secondary: "#0E241B",
      jersey_color: "#E03A3E",
      formation: "4-3-3 Attacking",
      score: 2,
      possession_percent: 54,
      shots_total: 9,
      shots_on_target: 5,
      passes_completed: 184,
      pass_accuracy: 88.2,
      xg: 1.84,
      fouls: 4,
      defensive_line_height_m: 48.6,
      compactness_m2: 684.2,
      centroid_m: [52.4, 33.8]
    },
    team_2: {
      id: 2,
      name: "Manchester City",
      short_name: "MCI",
      color: "#00E5FF", // Cyan
      color_secondary: "#102533",
      jersey_color: "#6CABDD",
      formation: "4-2-3-1 Mid-Block",
      score: 1,
      possession_percent: 46,
      shots_total: 7,
      shots_on_target: 3,
      passes_completed: 152,
      pass_accuracy: 84.6,
      xg: 1.12,
      fouls: 6,
      defensive_line_height_m: 44.2,
      compactness_m2: 720.5,
      centroid_m: [49.8, 34.6]
    }
  },
  pitch: {
    length_m: 105,
    width_m: 68,
    bounds: [0, 105, 0, 68]
  },
  players: [
    // Team 1
    { id: 1, team: 1, number: 8, name: "M. Ødegaard", role: "CAM", speed_max: 32.8, distance_m: 3420, avg_speed: 11.2, pass_acc: 91, x: 58, y: 34, stamina: 89, sprint_count: 22 },
    { id: 2, team: 1, number: 7, name: "B. Saka", role: "RW", speed_max: 34.8, distance_m: 3280, avg_speed: 12.4, pass_acc: 87, x: 74, y: 56, stamina: 92, sprint_count: 28 },
    { id: 3, team: 1, number: 11, name: "G. Martinelli", role: "LW", speed_max: 34.4, distance_m: 3190, avg_speed: 12.1, pass_acc: 83, x: 72, y: 12, stamina: 94, sprint_count: 27 },
    { id: 4, team: 1, number: 29, name: "K. Havertz", role: "ST", speed_max: 31.9, distance_m: 3010, avg_speed: 10.8, pass_acc: 80, x: 86, y: 34, stamina: 86, sprint_count: 19 },
    { id: 5, team: 1, number: 41, name: "D. Rice", role: "CDM", speed_max: 32.1, distance_m: 3650, avg_speed: 11.6, pass_acc: 93, x: 44, y: 38, stamina: 96, sprint_count: 24 },
    { id: 6, team: 1, number: 5, name: "T. Partey", role: "CM", speed_max: 29.8, distance_m: 2980, avg_speed: 10.2, pass_acc: 89, x: 46, y: 26, stamina: 82, sprint_count: 15 },
    { id: 7, team: 1, number: 2, name: "W. Saliba", role: "CB", speed_max: 33.2, distance_m: 2750, avg_speed: 9.4, pass_acc: 95, x: 26, y: 44, stamina: 88, sprint_count: 14 },
    { id: 8, team: 1, number: 6, name: "Gabriel", role: "CB", speed_max: 32.5, distance_m: 2690, avg_speed: 9.2, pass_acc: 92, x: 26, y: 24, stamina: 87, sprint_count: 13 },
    { id: 9, team: 1, number: 4, name: "B. White", role: "RB", speed_max: 31.5, distance_m: 3120, avg_speed: 10.9, pass_acc: 88, x: 38, y: 60, stamina: 85, sprint_count: 20 },
    { id: 10, team: 1, number: 12, name: "J. Timber", role: "LB", speed_max: 32.9, distance_m: 3080, avg_speed: 11.1, pass_acc: 86, x: 36, y: 8, stamina: 90, sprint_count: 21 },
    { id: 11, team: 1, number: 22, name: "D. Raya", role: "GK", speed_max: 22.4, distance_m: 1420, avg_speed: 5.2, pass_acc: 84, x: 8, y: 34, stamina: 98, sprint_count: 4 },

    // Team 2
    { id: 12, team: 2, number: 17, name: "K. De Bruyne", role: "CAM", speed_max: 31.8, distance_m: 3310, avg_speed: 10.9, pass_acc: 88, x: 48, y: 36, stamina: 85, sprint_count: 18 },
    { id: 13, team: 2, number: 9, name: "E. Haaland", role: "ST", speed_max: 35.2, distance_m: 2650, avg_speed: 9.8, pass_acc: 75, x: 28, y: 35, stamina: 91, sprint_count: 23 },
    { id: 14, team: 2, number: 47, name: "P. Foden", role: "RW", speed_max: 33.6, distance_m: 3250, avg_speed: 11.8, pass_acc: 86, x: 42, y: 15, stamina: 93, sprint_count: 25 },
    { id: 15, team: 2, number: 20, name: "B. Silva", role: "LW", speed_max: 32.0, distance_m: 3720, avg_speed: 12.0, pass_acc: 90, x: 44, y: 54, stamina: 97, sprint_count: 26 },
    { id: 16, team: 2, number: 16, name: "Rodri", role: "CDM", speed_max: 30.6, distance_m: 3580, avg_speed: 11.2, pass_acc: 94, x: 58, y: 33, stamina: 94, sprint_count: 17 },
    { id: 17, team: 2, number: 8, name: "M. Kovacic", role: "CM", speed_max: 31.2, distance_m: 3200, avg_speed: 11.0, pass_acc: 89, x: 60, y: 45, stamina: 86, sprint_count: 19 },
    { id: 18, team: 2, number: 2, name: "K. Walker", role: "RB", speed_max: 34.9, distance_m: 3180, avg_speed: 11.4, pass_acc: 85, x: 68, y: 12, stamina: 91, sprint_count: 24 },
    { id: 19, team: 2, number: 3, name: "R. Dias", role: "CB", speed_max: 31.5, distance_m: 2710, avg_speed: 9.3, pass_acc: 93, x: 78, y: 27, stamina: 89, sprint_count: 12 },
    { id: 20, team: 2, number: 25, name: "M. Akanji", role: "CB", speed_max: 32.4, distance_m: 2840, avg_speed: 9.6, pass_acc: 91, x: 79, y: 43, stamina: 88, sprint_count: 15 },
    { id: 21, team: 2, number: 24, name: "J. Gvardiol", role: "LB", speed_max: 33.1, distance_m: 3290, avg_speed: 11.3, pass_acc: 87, x: 70, y: 58, stamina: 92, sprint_count: 22 },
    { id: 22, team: 2, number: 31, name: "Ederson", role: "GK", speed_max: 23.1, distance_m: 1510, avg_speed: 5.4, pass_acc: 88, x: 98, y: 34, stamina: 97, sprint_count: 5 }
  ],
  events: [
    { id: "ev-1", type: "possession", timestamp: 1.2, frame: 30, team: 1, player_from: 1, text: "Ødegaard controls in central pocket", confidence: 0.94 },
    { id: "ev-2", type: "pass", timestamp: 3.8, frame: 95, team: 1, player_from: 1, player_to: 2, text: "Key through-ball to Saka down right channel", confidence: 0.96, pass_dist_m: 26.4 },
    { id: "ev-3", type: "pass", timestamp: 7.4, frame: 185, team: 1, player_from: 2, player_to: 4, text: "Low cutback to Havertz near penalty spot", confidence: 0.91, pass_dist_m: 18.2 },
    { id: "ev-4", type: "shot", timestamp: 8.9, frame: 222, team: 1, player_from: 4, text: "First-time shot saved by Ederson", confidence: 0.89, shot_speed_kmh: 96.5, xg: 0.42, outcome: "saved" },
    { id: "ev-5", type: "possession", timestamp: 11.2, frame: 280, team: 2, player_from: 16, text: "Rodri regains possession and launches counter", confidence: 0.92 },
    { id: "ev-6", type: "pass", timestamp: 13.5, frame: 337, team: 2, player_from: 16, player_to: 12, text: "Diagonal pass finding De Bruyne in space", confidence: 0.95, pass_dist_m: 31.8 },
    { id: "ev-7", type: "shot", timestamp: 16.2, frame: 405, team: 2, player_from: 13, text: "Haaland left-footed strike hits crossbar", confidence: 0.98, shot_speed_kmh: 112.4, xg: 0.58, outcome: "woodwork" },
    { id: "ev-8", type: "goal", timestamp: 20.8, frame: 520, team: 1, player_from: 2, text: "GOAL! Saka curls into far top corner (2-1)", confidence: 0.99, shot_speed_kmh: 104.2, xg: 0.18, outcome: "goal" },
    { id: "ev-9", type: "possession", timestamp: 24.1, frame: 602, team: 1, player_from: 5, text: "Declan Rice interception in defensive third", confidence: 0.93 },
    { id: "ev-10", type: "pass", timestamp: 26.5, frame: 662, team: 1, player_from: 5, player_to: 3, text: "Relieving long ball to Martinelli", confidence: 0.90, pass_dist_m: 38.6 }
  ],
  passing_network: {
    team_1: [
      { from: 1, to: 2, count: 18, length_m: 24.2 },
      { from: 1, to: 3, count: 12, length_m: 28.5 },
      { from: 1, to: 4, count: 9, length_m: 18.0 },
      { from: 5, to: 1, count: 24, length_m: 16.4 },
      { from: 5, to: 6, count: 14, length_m: 12.1 },
      { from: 6, to: 1, count: 16, length_m: 15.3 },
      { from: 7, to: 5, count: 19, length_m: 21.0 },
      { from: 8, to: 5, count: 17, length_m: 19.8 },
      { from: 9, to: 2, count: 22, length_m: 22.4 },
      { from: 10, to: 3, count: 18, length_m: 25.1 },
      { from: 11, to: 7, count: 15, length_m: 18.2 }
    ],
    team_2: [
      { from: 16, to: 12, count: 21, length_m: 19.5 },
      { from: 16, to: 17, count: 17, length_m: 14.2 },
      { from: 12, to: 13, count: 14, length_m: 23.0 },
      { from: 12, to: 14, count: 15, length_m: 26.8 },
      { from: 12, to: 15, count: 13, length_m: 24.5 },
      { from: 18, to: 14, count: 19, length_m: 20.2 },
      { from: 21, to: 15, count: 16, length_m: 21.5 },
      { from: 19, to: 16, count: 18, length_m: 22.0 },
      { from: 20, to: 16, count: 17, length_m: 20.8 }
    ]
  },
  highlights: [
    { id: "hl-1", title: "Arsenal Counter & Saka Goal", timestamp: 19.5, duration: 4.5, type: "goal", score_impact: "ARS 2 - 1 MCI", thumbnail_time: 20.8 },
    { id: "hl-2", title: "Haaland Rocket Strike on Woodwork", timestamp: 15.0, duration: 3.5, type: "shot", score_impact: "Near Miss", thumbnail_time: 16.2 },
    { id: "hl-3", title: "Ederson Point-Blank Reflex Save", timestamp: 7.5, duration: 3.0, type: "save", score_impact: "Big Chance", thumbnail_time: 8.9 },
    { id: "hl-4", title: "Ødegaard Disguised Through-Ball", timestamp: 2.5, duration: 3.0, type: "pass", score_impact: "Key Pass", thumbnail_time: 3.8 }
  ]
};

// Generates dynamic simulated coordinate tracks for smooth continuous video scrubbing & sync
function getSimulatedFrameData(frameIndex, totalFrames = 712) {
  const t = (frameIndex / totalFrames) * 28.5;
  const progress = frameIndex / totalFrames;
  
  // Ball movement interpolation across key moments
  let ballX = 52.5 + Math.sin(progress * Math.PI * 4) * 28 + (progress > 0.65 ? (progress - 0.65) * 45 : 0);
  let ballY = 34 + Math.cos(progress * Math.PI * 3) * 18;
  ballX = Math.max(5, Math.min(100, ballX));
  ballY = Math.max(4, Math.min(64, ballY));

  // Determine current ball possessor
  let ballPossessor = null;
  let minDist = 999;
  
  const players = MATCH_DATA.players.map(p => {
    // Dynamic trajectory drift around player's average position
    const freq = (p.id * 1.3) % 3 + 1;
    const dx = Math.sin(t * 0.8 + p.id) * (p.role === "GK" ? 2.5 : 8.5) + (ballX - p.x) * 0.15;
    const dy = Math.cos(t * 0.9 + p.id) * (p.role === "GK" ? 3.0 : 6.0) + (ballY - p.y) * 0.12;
    const currX = Math.max(2, Math.min(103, p.x + dx));
    const currY = Math.max(2, Math.min(66, p.y + dy));
    
    // Dynamic instantaneous speed (km/h)
    const baseSpeed = p.avg_speed;
    const speed = +(baseSpeed + Math.sin(t * 2 + p.id) * 7.5 + (p.id === 2 && progress > 0.65 ? 12 : 0)).toFixed(1);
    
    // Track distance to ball
    const dist = Math.hypot(currX - ballX, currY - ballY);
    if (dist < minDist && dist < 7) {
      minDist = dist;
      ballPossessor = p.id;
    }

    // Video 2D screen projected coordinates (approximate screen 16:9 projection)
    // Camera pan and zoom simulation
    const camPanX = (ballX - 52.5) * 6;
    const screenX = 960 + (currX - 52.5) * 15 - camPanX;
    const screenY = 620 + (currY - 34) * 11 - (currX > 52.5 ? 40 : 0);
    const boxW = 44 - (currY * 0.15);
    const boxH = 92 - (currY * 0.25);

    return {
      id: p.id,
      name: p.name,
      number: p.number,
      team: p.team,
      role: p.role,
      x: currX,
      y: currY,
      speed_kmh: Math.max(4.2, speed),
      screen_bbox: [screenX - boxW/2, screenY - boxH, boxW, boxH],
      has_ball: false
    };
  });

  if (ballPossessor) {
    const carrier = players.find(p => p.id === ballPossessor);
    if (carrier) carrier.has_ball = true;
  }

  // Active possession team
  const activeTeam = ballPossessor ? (ballPossessor <= 11 ? 1 : 2) : (progress > 0.4 && progress < 0.65 ? 2 : 1);

  return {
    frameIndex,
    timestamp: t,
    activeTeam,
    ball: { x: ballX, y: ballY, screen_x: 960 + (ballX - 52.5) * 15 - (ballX - 52.5) * 6, screen_y: 620 + (ballY - 34) * 11 },
    players
  };
}
