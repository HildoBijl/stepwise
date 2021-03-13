const { FloatUnit } = require('../inputTypes/FloatUnit')

// Data for a given temperature.
const temperatureRange = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 255, 260, 265, 270, 275, 280, 285, 290, 295, 300, 305, 310, 315, 320, 325, 330, 335, 340, 345, 350, 355, 360, 365, 370].map(T => new FloatUnit({ float: T, unit: 'dC' }).makeExact())
const withTemperature = {
	boilingPressure: {
		grid: ['0.0061', '0.0123', '0.0234', '0.0424', '0.0737', '0.1233', '0.1992', '0.3116', '0.4736', '0.7011', '1.013', '1.433', '1.985', '2.701', '3.614', '4.76', '6.18', '7.92', '10.03', '12.55', '15.55', '19.08', '23.20', '27.98', '33.48', '39.78', '43.24', '46.94', '50.87', '55.05', '59.49', '64.19', '69.17', '74.45', '80.03', '85.9', '92.1', '98.7', '105.6', '112.9', '120.6', '128.7', '137.1', '146.1', '155.5', '165.4', '175.8', '186.7', '198.3', '210.5'].map(p => new FloatUnit({ float: p, unit: 'bar' })),
	},
	enthalpyLiquid: {
		grid: ['0.0', '42.0', '83.9', '125.6', '167.3', '209.1', '250.9', '292.8', '334.7', '376.8', '418.9', '461.1', '503.5', '546.1', '588.9', '631.9', '675.2', '718.8', '762.7', '807.0', '851.8', '897.1', '943.0', '989.6', '1036.9', '1085.1', '1109.5', '1134.3', '1159.3', '1184.5', '1210.2', '1236.1', '1262.5', '1289.3', '1316.5', '1344.2', '1372.5', '1401.3', '1430.9', '1461.3', '1492.5', '1524.8', '1558.4', '1593.5', '1630.5', '1670.3', '1714.5', '1762.2', '1817.9', '1893.7'].map(h => new FloatUnit({ float: h, unit: 'kJ/kg' })),
	},
	enthalpyVapor: {
		grid: ['2500.5', '2518.9', '2537.3', '2555.5', '2573.5', '2591.3', '2608.8', '2625.9', '2642.5', '2658.7', '2674.4', '2689.6', '2704.2', '2718.3', '2731.8', '2744.5', '2756.5', '2767.6', '2777.6', '2786.3', '2793.7', '2799.4', '2803.4', '285.4', '2805.1', '2802.5', '2800.3', '2797.4', '2793.8', '2789.5', '2784.5', '2778.7', '2772.2', '2764.9', '2756.9', '2745.0', '2738.3', '2727.7', '2716.8', '2702.4', '2685.7', '2666.4', '2644.3', '2620.2', '2593.4', '2562.3', '2527.3', '2483.1', '2425.9', '2339.9'].map(h => new FloatUnit({ float: h, unit: 'kJ/kg' })),
	},
	entropyLiquid: {
		grid: ['0.0000', '0.1511', '0.2963', '0.4364', '0.5718', '0.7031', '0.8304', '0.9542', '1.0747', '1.1920', '1.3063', '1.4179', '1.5270', '1.6338', '1.7383', '1.8409', '1.9416', '2.0407', '2.1382', '2.2343', '23293', '2.4232', '2.5162', '2.6086', '2.7004', '2.7918', '2.8375', '2.8832', '2.9289', '2.9747', '3.0206', '3.0666', '3.1128', '3.1593', '3.2061', '3.2532', '3.3008', '3.3489', '3.3977', '3.4473', '3.4978', '3.5495', '3.6026', '3.6577', '3.7154', '3.7768', '3.8431', '3.9159', '4.0013', '4.1131'].map(s => new FloatUnit({ float: s, unit: 'kJ/kg * K' })),
	},
	entropyVapor: {
		grid: ['9.1545', '8.8985', '8.6652', '8.4516', '8.2553', '8.0745', '7.9074', '7.7526', '7.6088', '7.4749', '7.3500', '7.2331', '7.1236', '7.0208', '6.9240', '6.8325', '6.7456', '6.6628', '6.5833', '6.5067', '6.4322', '6.3593', '6.2875', '6.2162', '6.1452', '6.0738', '6.0380', '6.0019', '5.9656', '5.9290', '5.8921', '5.8549', '5.8174', '5.7794', '5.7410', '5.7022', '5.6629', '5.6232', '5.5837', '5.5401', '5.4924', '5.4422', '5.3884', '5.3321', '5.2733', '5.2087', '5.1371', '5.0545', '4.9541', '4.8069'].map(s => new FloatUnit({ float: s, unit: 'kJ/kg * K' })),
	},
}
Object.values(withTemperature).forEach(column => {
	column.labels = ['Temperature']
	column.headers = [temperatureRange]
})
module.exports.withTemperature = withTemperature

// Data for a given pressure.
const pressureRange = [0.01, 0.02, 0.05, 0.1, 0.2, 0.4, 0.6, 0.8, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40, 45, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210].map(p => new FloatUnit({ float: p, unit: 'bar' }).makeExact())
const withPressure = {
	boilingTemperature: {
		grid: ['6.98', '17.51', '32.9', '45.8', '60.1', '75.9', '86.0', '93.5', '99.6', '120.2', '133.5', '143.6', '151.9', '158.8', '165.0', '170.4', '175.4', '180.0', '188.0', '195.0', '201.4', '207.1', '212.4', '217.2', '221.8', '226.0', '230.0', '233.8', '237.4', '244.2', '250.3', '257.4', '263.9', '275.6', '285.8', '295.0', '303.3', '311.0', '318.0', '324.6', '330.8', '336.6', '342.1', '347.3', '352.3', '357.0', '361.4', '365.7', '369.8'].map(T => new FloatUnit({ float: T, unit: 'dC' })),
	},
	enthalpyLiquid: {
		grid: ['29.4', '73.5', '137.7', '191.7', '251.3', '317.5', '359.7', '391.5', '417.3', '504.5', '561.2', '604.4', '639.9', '670.1', '696.7', '720.6', '742.2', '762.2', '797.9', '829.5', '858.0', '884.0', '908.0', '930.3', '951.3', '971.0', '989.8', '1007.7', '1024.7', '1056.9', '1086.7', '1121.4', '1153.8', '1213.1', '1266.7', '1316.4', '1362.9', '1407.0', '1449.3', '1490.2', '1530.2', '1569.6', '1608.9', '1648.5', '1689.4', '1732.9', '1777.3', '1826.7', '1889.9'].map(h => new FloatUnit({ float: h, unit: 'kJ/kg' })),
	},
	enthalpyVapor: {
		grid: ['2513.4', '2532.7', '2560.7', '2583.9', '2608.9', '2635.7', '2652.2', '2664.3', '2673.8', '2704.6', '2723.2', '2736.5', '2746.8', '2755.2', '2762.1', '2768.0', '2773.1', '2777.5', '2784.7', '2790.2', '2794.6', '2798.0', '2800.6', '2802.5', '2803.9', '2804.8', '2805.4', '2805.5', '2805.4', '2804.4', '2802.4', '2799.0', '2794.6', '2783.9', '2771.1', '2756.9', '2741.6', '2725.6', '2708.7', '2687.2', '2663.5', '2637.7', '2610.5', '2581.2', '2547.0', '2511.4', '2468.4', '2416.0', '2344.9'].map(h => new FloatUnit({ float: h, unit: 'kJ/kg' })),
	},
	entropyLiquid: {
		grid: ['0.1061', '0.2607', '0.4761', '0.6489', '0.8316', '1.0255', '1.1449', '1.2324', '1.3022', '1.5295', '1.6711', '1.7757', '1.8596', '1.9300', '1.9909', '2.0447', '2.0931', '2.1370', '2.2148', '2.2823', '2.3422', '2.3961', '2.4453', '2.4906', '2.5327', '2.5720', '2.6089', '2.6438', '2.6769', '2.7385', '2.7949', '2.8596', '2.9190', '3.0257', '3.1203', '3.2059', '3.2847', '3.3582', '3.4277', '3.4941', '3.5580', '3.6203', '3.6818', '3.7433', '3.8062', '3.8707', '3.9389', '4.0151', '4.1073'].map(s => new FloatUnit({ float: s, unit: 'kJ/kg * K' })),
	},
	entropyVapor: {
		grid: ['8.9734', '8.7214', '8.3930', '8.1480', '7.9060', '7.6667', '7.5280', '7.4300', '7.3544', '7.1212', '6.9859', '6.8902', '3.8161', '6.7555', '6.7041', '6.6594', '6.6198', '6.5843', '6.5221', '6.4689', '6.4221', '6.3802', '6.3422', '6.3072', '6.2748', '6.2445', '6.2159', '6.1890', '6.1634', '6.1155', '6.0714', '6.026', '5.9735', '5.8880', '5.8113', '5.7412', '5.6762', '5.6155', '5.5584', '5.4971', '5.4353', '5.3726', '5.3104', '5.2471', '5.1775', '5.1062', '5.0280', '4.9375', '4.8149'].map(s => new FloatUnit({ float: s, unit: 'kJ/kg * K' })),
	},
}
Object.values(withPressure).forEach(column => {
	column.labels = ['Pressure']
	column.headers = [pressureRange]
})
module.exports.withPressure = withPressure

// Enthalpy of superheated steam.
const enthalpy = {
	labels: ['Pressure', 'Temperature'],
	headers: [
		[14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40, 45, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200].map(p => new FloatUnit({ float: p, unit: 'bar' }).makeExact()),
		[220, 240, 260, 280, 300, 320, 340, 360, 380, 400, 420, 440, 460, 480, 500, 520, 540, 560, 580, 600, 620, 640, 660, 680, 700, 720].map(T => new FloatUnit({ float: T, unit: 'dC' }).makeExact()),
	],
	grid: [
		['2858.2', '2847.8', '2836.6', '2824.6', '2811.7', undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
		['2905.9', '2897.7', '2889.1', '2880.0', '2870.6', '2860.6', '2850.1', '2839.0', '2827.2', '2814.8', undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
		['2951.4', '2944.5', '2937.4', '2930.0', '2922.4', '2914.5', '2906.4', '2897.9', '2889.1', '2879.9', '2860.4', '2839.1', '2809.7', undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
		['2995.9', '2989.9', '2983.8', '2977.5', '2971.1', '2967.5', '2957.8', '2950.9', '2943.8', '2936.5', '2921.2', '2904.9', '2882.9', '2859.0', '2804.6', undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
		['3039.8', '3034.5', '3029.1', '3023.6', '3018.1', '3012.4', '3006.7', '3000.8', '2994.8', '2988.7', '2976.1', '2962.9', '2945.5', '2926.9', '2885.7', '2838.4', '2783.9', undefined, undefined, undefined, undefined, undefined, undefined, undefined],
		['3083.4', '3078.6', '3073.8', '3068.9', '3064.0', '3059.0', '3054.0', '3048.9', '3043.7', '3038.5', '3027.7', '3016.6', '3002.2', '2987.0', '2954.2', '2917.7', '2876.8', '2830.8', '2779.4', undefined, undefined, undefined, undefined, undefined],
		['3126.7', '3122.4', '3118.0', '3113.6', '3109.2', '3104.8', '3100.3', '3095.8', '3091.3', '3086.7', '3077.3', '3067.7', '3055.3', '3042.5', '3015.4', '2985.9', '2953.6', '2918.2', '2879.4', '2789.8', '2667.0', undefined, undefined, undefined],
		['3169.9', '3165.9', '3162.0', '3158.0', '3154.1', '3150.1', '3146.0', '3142.0', '3137.9', '3133.8', '3125.5', '3117.1', '3106.3', '3095.2', '3072.0', '3047.4', '3020.9', '2992.5', '2961.9', '2892.9', '2812.6', '2712.2', '2564.4', undefined],
		['3213.0', '3209.4', '3205.8', '3202.2', '3198.6', '3195.0', '3191.3', '3187.6', '3184.0', '3180.3', '3172.8', '3165.3', '3155.7', '3145.9', '3125.7', '3104.5', '3082.2', '3058.6', '3033.5', '2978.4', '2915.8', '2844.8', '2762.9', '2659.5'],
		['3256.1', '3252.8', '3249.5', '3246.2', '3242.9', '3239.6', '3236.3', '3232.9', '3229.6', '3226.2', '3219.5', '3212.7', '3204.0', '3195.3', '3177.4', '3158.8', '3139.5', '3119.5', '3098.2', '3052.7', '3002.1', '2946.0', '2883.8', '2815.0'],
		['3299.2', '3296.2', '3293.2', '3290.2', '3287.1', '3284.1', '3281.0', '3278.0', '3274.9', '3271.8', '3265.7', '3259.5', '3251.7', '3243.7', '3227.7', '3211.1', '3194.1', '3176.5', '3158.3', '3119.6', '3077.6', '3031.8', '2981.8', '2927.4'],
		['3342.4', '3339.7', '3336.9', '3334.1', '3331.3', '3328.5', '3325.7', '3322.9', '3320.1', '3317.2', '3311.6', '3305.9', '3298.7', '3291.5', '3277.0', '3262.1', '3246.8', '3231.2', '3215.2', '3181.6', '3145.7', '3107.3', '3066.0', '3021.7'],
		['3385.8', '3383.2', '3380.6', '3378.0', '3375.4', '3372.8', '3370.3', '3367.7', '3365.1', '3362.5', '3357.3', '3352.0', '3345.5', '3338.9', '3325.5', '3312.0', '3298.2', '3284.2', '3269.9', '3240.2', '3209.0', '3175.9', '3140.9', '3103.8'],
		['3429.2', '3426.8', '3424.4', '3422.0', '3419.6', '3417.2', '3414.8', '3412.4', '3410.0', '3407.6', '3402.8', '3398.0', '3391.9', '3385.8', '3373.6', '3361.2', '3348.6', '3335.9', '3323.0', '3296.4', '3268.7', '3239.8', '3209.5', '3177.7'],
		['3472.8', '3470.6', '3468.3', '3466.1', '3463.9', '3461.7', '3459.4', '3457.2', '3455.0', '3452.7', '3448.3', '3443.8', '3438.2', '3432.5', '3421.2', '3409.8', '3398.3', '3386.6', '3374.8', '3350.8', '3325.9', '3300.2', '3273.5', '3254.8'],
		['3516.5', '3514.5', '3512.4', '3510.3', '3508.3', '3506.2', '3504.1', '3502.0', '3499.9', '3497.9', '3493.7', '3489.5', '3484.3', '3479.1', '3468.6', '3458.0', '3447.4', '3436.7', '3425.9', '3403.9', '3381.3', '3358.2', '3334.3', '3309.7'],
		['3560.5', '3558.5', '3556.6', '3554.7', '3552.7', '3550.8', '3548.9', '3546.9', '3545.0', '3543.0', '3539.2', '3535.3', '3530.4', '3525.5', '3515.8', '3506.0', '3496.1', '3486.2', '3476.2', '3456.0', '3435.4', '3414.3', '3392.8', '3370.7'],
		['3604.6', '3602.8', '3601.0', '3599.2', '3597.4', '3595.5', '3593.7', '3591.9', '3590.1', '3588.3', '3584.7', '3581.0', '3576.5', '3571.9', '3562.8', '3553.7', '3544.5', '3535.3', '3526.0', '3507.3', '3488.3', '3469.0', '3449.4', '3429.4'],
		['3648.9', '3647.2', '3645.5', '3643.8', '3642.1', '3640.4', '3638.7', '3637.0', '3635.3', '3633.6', '3630.2', '3626.8', '3622.6', '3618.3', '3609.8', '3601.3', '3592.7', '3584.1', '3575.5', '3558.1', '3540.5', '3522.7', '3504.7', '3486.3'],
		['3693.5', '3691.9', '3690.3', '3688.7', '3687.1', '3685.5', '3683.9', '3682.3', '3680.7', '3679.1', '3675.9', '3672.7', '3668.7', '3664.7', '3656.7', '3648.7', '3640.7', '3632.7', '3624.6', '3608.4', '3592.1', '3575.5', '3558.9', '3542.0'],
		['3738.2', '3736.7', '3735.2', '3733.7', '3732.2', '3730.7', '3729.2', '3727.7', '3726.2', '3724.7', '3721.7', '3718.7', '3715.0', '3711.2', '3703.7', '3696.2', '3688.6', '3681.1', '3673.5', '3658.4', '3643.1', '3627.7', '3612.2', '3596.6'],
		['3783.2', '3781.8', '3780.4', '3779.0', '3777.6', '3776.1', '3774.7', '3773.3', '3771.9', '3770.5', '3767.6', '3764.8', '3761.3', '3757.7', '3750.7', '3743.6', '3736.5', '3729.4', '3722.3', '3708.1', '3693.8', '3679.4', '3665.0', '3650.4'],
		['3828.4', '3827.1', '3825.8', '3824.4', '3823.1', '3821.8', '3820.4', '3819.1', '3817.7', '3816.4', '3813.7', '3811.1', '3807.7', '3804.4', '3797.7', '3791.0', '3784.4', '3777.7', '3771.0', '3757.6', '3744.2', '3730.7', '3717.2', '3703.6'],
		['3873.9', '3872.6', '3871.4', '3870.1', '3868.8', '3867.6', '3866.3', '3865.0', '3863.8', '3862.5', '3860.0', '3857.5', '3854.3', '3851.2', '3844.8', '3838.5', '3832.2', '3825.9', '3819.6', '3807.0', '3794.3', '3781.7', '3769.0', '3756.2'],
		['3919.6', '3918.4', '3917.2', '3916.0', '3914.8', '3913.6', '3912.4', '3911.2', '3910.0', '3908.8', '3906.4', '3904.0', '3901.0', '3898.0', '3892.1', '3886.1', '3880.1', '3874.2', '3868.2', '3856.3', '3844.3', '3832.4', '3820.4', '3808.5'],
		['3965.5', '3964.4', '3963.3', '3962.1', '3961.0', '3959.9', '3958.7', '3957.6', '3956.4', '3955.3', '3953.0', '3950.8', '3947.9', '3945.1', '3939.4', '3933.8', '3928.1', '3922.5', '3916.8', '3905.5', '3894.2', '3882.9', '3871.7', '3860.4'],
	].map(arr => arr.map(h => h === undefined ? undefined : new FloatUnit({ float: h, unit: 'kJ/kg' }))),
}
module.exports.enthalpy = enthalpy

// Entropy of superheated steam.
const entropy = {
	labels: ['Pressure', 'Temperature'],
	headers: [
		[14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40, 45, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200].map(p => new FloatUnit({ float: p, unit: 'bar' }).makeExact()),
		[220, 240, 260, 280, 300, 320, 340, 360, 380, 400, 420, 440, 460, 480, 500, 520, 540, 560, 580, 600, 620, 640, 660, 680, 700, 720].map(T => new FloatUnit({ float: T, unit: 'dC' }).makeExact()),
	],
	grid: [
		['6.6106', '6.5322', '6.4598', '6.3914', '6.3259', undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
		['6.7053', '6.6313', '6.5640', '6.5016', '6.4430', '6.3873', '6.3339', '6.2821', '6.2315', '6.1817', undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
		['6.7924', '6.7209', '6.6564', '6.5971', '6.5421', '6.4905', '6.4416', '6.3948', '6.3498', '6.3063', '6.2222', '6.1409', '6.0407', undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
		['6.8743', '6.8045', '6.7418', '6.6846', '6.6318', '6.5826', '6.5363', '6.4924', '6.4506', '6.4104', '6.3343', '6.2621', '6.1757', '6.0917', '5.9255', undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
		['6.9523', '6.8837', '6.8223', '6.7665', '6.7152', '6.6676', '6.6230', '6.5810', '6.5412', '6.5032', '6.4318', '6.3652', '6.2868', '6.2123', '6.0698', '5.9302', '5.7886', undefined, undefined, undefined, undefined, undefined, undefined, undefined],
		['7.0269', '6.9593', '6.8989', '6.8442', '6.7940', '6.7475', '6.7042', '6.6635', '6.6251', '6.5886', '6.5204', '6.4573', '6.3840', '6.3154', '6.1873', '6.0663', '5.9479', '5.8289', '5.7070', undefined, undefined, undefined, undefined, undefined],
		['7.0987', '7.0319', '6.9723', '6.9184', '6.8690', '6.8235', '6.7811', '6.7413', '6.7039', '6.6685', '6.6025', '6.5420', '6.4722', '6.4075', '6.2888', '6.1794', '6.0754', '5.9739', '5.8728', '5.6658', '5.4345', undefined, undefined, undefined],
		['7.1680', '7.1018', '7.0429', '6.9896', '6.9410', '6.8961', '6.8544', '6.8155', '6.7788', '6.7442', '6.6799', '6.6212', '6.5539', '6.4919', '6.3796', '6.2781', '6.1835', '6.0931', '6.0053', '5.8314', '5.6538', '5.4659', '5.1874', undefined],
		['7.2351', '7.1694', '7.1110', '7.0583', '7.0102', '6.9659', '6.9248', '6.8864', '6.8504', '6.8164', '6.7535', '6.6962', '6.6308', '6.5708', '6.4631', '6.3670', '6.2787', '6.1959', '6.1167', '5.9644', '5.8143', '5.6618', '5.4994', '5.3120'],
		['7.3001', '7.2349', '7.1769', '7.1246', '7.0770', '7.0332', '6.9926', '6.9547', '6.9192', '6.8857', '6.8239', '6.7677', '6.7037', '6.6453', '6.5410', '6.4489', '6.3652', '6.2875', '6.2143', '6.0764', '5.9446', '5.8145', '5.6833', '5.5488'],
		['7.3632', '7.2984', '7.2408', '7.1890', '7.1417', '7.0983', '7.0581', '7.0207', '6.9856', '6.9525', '6.8915', '6.8362', '6.7734', '6.7163', '6.6147', '6.5255', '6.4451', '6.3713', '6.3023', '6.1744', '6.0550', '5.9401', '5.8268', '5.7134'],
		['7.4247', '7.3602', '7.3030', '7.2514', '7.2046', '7.1615', '7.1216', '7.0845', '7.0498', '7.0170', '6.9568', '6.9022', '6.8404', '6.7842', '6.6848', '6.5979', '6.5201', '6.4491', '6.3832', '6.2626', '6.1520', '6.0476', '5.9467', '5.8475'],
		['7.4846', '7.4204', '7.3634', '7.3122', '7.2656', '7.2228', '7.1833', '7.1465', '7.1120', '7.0796', '7.0200', '6.9660', '6.9050', '6.8497', '6.7519', '6.6670', '6.5912', '6.5223', '6.4588', '6.3437', '6.2395', '6.1425', '6.0503', '5.9611'],
		['7.5431', '7.4791', '7.4224', '7.3714', '7.3251', '7.2826', '7.2433', '7.2067', '7.1725', '7.1404', '7.0812', '7.0279', '6.9675', '6.9129', '6.8166', '6.7331', '6.6590', '6.5919', '6.5303', '6.4192', '6.3199', '6.2284', '6.1425', '6.0606'],
		['7.6002', '7.5365', '7.4800', '7.4292', '7.3831', '7.3408', '7.3017', '7.2654', '7.2314', '7.1995', '7.1408', '7.0879', '7.0281', '6.9741', '6.8790', '6.7969', '6.7241', '6.6584', '6.5983', '6.4905', '6.3949', '6.3076', '6.2265', '6.1498'],
		['7.6561', '7.5925', '7.5362', '7.4857', '7.4397', '7.3976', '7.3588', '7.3226', '7.2888', '7.2571', '7.1989', '7.1463', '7.0871', '7.0335', '6.9395', '6.8585', '6.7868', '6.7223', '6.6634', '6.5583', '6.4656', '6.3817', '6.3041', '6.2315'],
		['7.7108', '7.6474', '7.5913', '7.5409', '7.4951', '7.4532', '7.4145', '7.3785', '7.3449', '7.3134', '7.2554', '7.2033', '7.1445', '7.0914', '6.9983', '6.9181', '6.8475', '6.7840', '6.7261', '6.6232', '6.5329', '6.4515', '6.3769', '6.3074'],
		['7.7644', '7.7011', '7.6452', '7.5949', '7.5493', '7.5076', '7.4690', '7.4332', '7.3997', '7.3683', '7.3107', '7.2589', '7.2004', '7.1478', '7.0555', '6.9761', '6.9063', '6.8436', '6.7866', '6.6856', '6.5972', '6.5180', '6.4457', '6.3786'],
		['7.8170', '7.7539', '7.6980', '7.6479', '7.6024', '7.5608', '7.5224', '7.4867', '7.4534', '7.4221', '7.3648', '7.3132', '7.2551', '7.2028', '7.1112', '7.0325', '6.9634', '6.9015', '6.8453', '6.7458', '6.6591', '6.5817', '6.5113', '6.4462'],
		['7.8686', '7.8056', '7.7499', '7.6999', '7.6545', '7.6130', '7.5747', '7.5391', '7.5059', '7.4748', '7.4177', '7.3665', '7.3086', '7.2565', '7.1656', '7.0876', '7.0190', '6.9578', '6.9022', '6.8041', '6.7189', '6.6429', '6.5741', '6.5107'],
		['7.9193', '7.8564', '7.8008', '7.7509', '7.7056', '7.6642', '7.6260', '7.5906', '7.5575', '7.5264', '7.4696', '7.4184', '7.3609', '7.3092', '7.2187', '7.1413', '7.0733', '7.0126', '6.9576', '6.8607', '6.7767', '6.7020', '6.6345', '6.5726'],
		['7.9691', '7.9063', '7.8508', '7.8010', '7.7558', '7.7145', '7.6764', '7.6411', '7.6081', '7.5771', '7.5204', '7.4695', '7.4122', '7.3607', '7.2707', '7.1938', '7.1263', '7.0661', '7.0116', '6.9158', '6.8328', '6.7593', '6.6929', '6.6321'],
		['8.0181', '7.9554', '7.8999', '7.8502', '7.8052', '7.7639', '7.7259', '7.6906', '7.6577', '7.6269', '7.5704', '7.5196', '7.4625', '7.4112', '7.3217', '7.2452', '7.1782', '7.1184', '7.0644', '6.9694', '6.8874', '6.8148', '6.7494', '6.6897'],
		['8.0663', '8.0063', '7.9483', '7.8987', '7.8537', '7.8125', '7.7746', '7.7394', '7.7065', '7.6757', '7.6194', '7.5688', '7.5119', '7.4608', '7.3717', '7.2955', '7.2289', '7.1696', '7.1159', '7.0218', '6.9406', '6.8689', '6.8044', '6.7456'],
		['8.1137', '8.0511', '7.9959', '7.9463', '7.9014', '7.8603', '7.8224', '7.7873', '7.7545', '7.7238', '7.6676', '7.6171', '7.5604', '7.5095', '7.4207', '7.3449', '7.2786', '7.2196', '7.1664', '7.0729', '6.9925', '6.9215', '6.8578', '6.7998'],
		['8.1604', '8.0979', '8.0427', '7.9932', '7.9484', '7.9073', '7.8695', '7.8345', '7.8018', '7.7711', '7.7150', '7.6647', '7.6081', '7.5573', '7.4689', '7.3934', '7.3274', '7.2688', '7.2158', '7.1230', '7.0432', '6.9729', '6.9099', '6.8526'],
	].map(arr => arr.map(s => s === undefined ? undefined : new FloatUnit({ float: s, unit: 'kJ/kg * K' }))),
}
module.exports.entropy = entropy