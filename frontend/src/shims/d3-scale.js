export function scaleLinear() {
  let domain = [0, 1];
  let range = [0, 1];
  function scale(x) {
    const d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
    return r0 + ((x - d0) * (r1 - r0)) / (d1 - d0 || 1);
  }
  scale.domain = function(d) {
    if (!arguments.length) return domain;
    domain = d;
    return scale;
  };
  scale.range = function(r) {
    if (!arguments.length) return range;
    range = r;
    return scale;
  };
  scale.clamp = function() { return scale; };
  scale.nice = function() { return scale; };
  scale.ticks = function() { return []; };
  scale.copy = function() { return scaleLinear().domain(domain).range(range); };
  return scale;
}

export function scaleBand() {
  let domain = [];
  let range = [0, 1];
  function scale(x) {
    const idx = domain.indexOf(x);
    if (idx === -1) return range[0];
    const step = (range[1] - range[0]) / (domain.length || 1);
    return range[0] + idx * step;
  }
  scale.domain = function(d) {
    if (!arguments.length) return domain;
    domain = d;
    return scale;
  };
  scale.range = function(r) {
    if (!arguments.length) return range;
    range = r;
    return scale;
  };
  scale.bandwidth = function() {
    return (range[1] - range[0]) / (domain.length || 1);
  };
  return scale;
}

export default { scaleLinear, scaleBand };
