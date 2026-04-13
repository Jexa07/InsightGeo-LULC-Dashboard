import { describe, it } from 'vitest';
import { computeLandUseChanges } from './geoUtils';
import fs from 'fs';

describe('Stats Verification', () => {
    it('calculates full dataset stats', () => {
        const file2016 = 'c:/Users/hp/Downloads/geo-change-insight-main/area_2016.geojson';
        const file2024 = 'c:/Users/hp/Downloads/geo-change-insight-main/area_2024.geojson';

        const data2016 = JSON.parse(fs.readFileSync(file2016, 'utf-8'));
        const data2024 = JSON.parse(fs.readFileSync(file2024, 'utf-8'));

        const results = computeLandUseChanges(data2016, data2024);

        let output = 'STATS_START\n';
        results.changes.forEach(c => {
            output += `${c.className}:\n`;
            output += `  Change: ${c.change > 0 ? '+' : ''}${c.change.toFixed(5)} km2\n`;
            output += `  Percent: ${c.percentChange > 0 ? '+' : ''}${c.percentChange.toFixed(1)}%\n`;
        });

        output += `\nTOTALS:\n`;
        output += `Total Area Before: ${results.totalAreaBefore.toFixed(5)} km2\n`;
        output += `Total Area After: ${results.totalAreaAfter.toFixed(5)} km2\n`;
        output += `Total Changed Area: ${results.totalChanged.toFixed(5)} km2\n`;

        output += `\nLANDMARKS:\n`;
        if (results.largestIncrease) {
            output += `Largest Increase: ${results.largestIncrease.className} (${results.largestIncrease.change.toFixed(5)} km2)\n`;
        }
        if (results.largestDecrease) {
            output += `Largest Decrease: ${results.largestDecrease.className} (${results.largestDecrease.change.toFixed(5)} km2)\n`;
        }
        output += 'STATS_END\n';

        fs.writeFileSync('verify_output.txt', output);
    });
});
