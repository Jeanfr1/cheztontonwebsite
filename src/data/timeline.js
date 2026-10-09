// Hero scroll timeline, from 07-integracao/timeline.json (progress 0–1 over the 225svh track).
// The kit's last phase (bar and cave photos opening as windows) is left out: the next section shows
// the same photos, so the hero ends on the poster. Phases keep their original scroll length.
export const segments = {
  frigo: [0, 0.19], //            cold POV, slight zoom out, title and actions already usable
  revelation: [0.19, 0.49], //    fridge dissolves to paper; the bottle lifts out of the photo
  composition: [0.49, 0.74], //   glass rises in the foreground, beer arc pours in
  arc: [0.74, 1], //              short arc drift, objects settle so the poster reads
};
