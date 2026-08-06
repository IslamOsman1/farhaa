function toDisplayValue(value) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function flattenObject(input, prefix = '', target = {}) {
  if (Array.isArray(input)) {
    input.forEach((item, index) => flattenObject(item, `${prefix}[${index}]`, target));
    return target;
  }

  if (input && typeof input === 'object') {
    Object.entries(input).forEach(([key, value]) => {
      const nextPrefix = prefix ? `${prefix}.${key}` : key;
      flattenObject(value, nextPrefix, target);
    });
    return target;
  }

  target[prefix] = input;
  return target;
}

export function summarizeRevisionDiff(fromSnapshot = {}, toSnapshot = {}) {
  const before = flattenObject(fromSnapshot);
  const after = flattenObject(toSnapshot);
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();

  const changes = keys
    .filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]))
    .map((key) => ({
      key,
      before: before[key],
      after: after[key],
      beforeDisplay: toDisplayValue(before[key]),
      afterDisplay: toDisplayValue(after[key]),
      category: key.split('.')[0] || 'general',
    }));

  return {
    totalChanges: changes.length,
    categories: [...new Set(changes.map((change) => change.category))],
    changes,
  };
}
