import { Country } from '../types'
import { motion } from 'framer-motion'
import { useState, useRef } from 'react'

interface Props {
    country: Country
}

export default function CurrentOverview({ country }: Props) {
    const [added, setAdded] = useState<{ [key: string]: number }>({});
    const [currentDragIndex, setCurrentDragIndex] = useState(-1);
    const iconRefs = useRef<(HTMLImageElement | null)[]>([]);
    const techRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    const [icons, setIcons] = useState(
        Array.from({ length: 5 }, (_, i) => ({ id: i, used: false }))
    );

    const allTechnologies = [
        { id: "hydro", name: "Hydro" },
        { id: "nuclear", name: "Nuclear" },
        { id: "solar", name: "Solar" },
        { id: "wind", name: "Wind" },
        { id: "biomass", name: "Biomass" },
        { id: "coal", name: "Coal" },
        { id: "oil", name: "Oil" },
        { id: "gas", name: "Gas" },
    ];

    const baseProduction = country.totalGenerationTWh;
    const years = 2050 - 2025;
    const annualGrowthRate = 0.02;
    const predictedProduction = baseProduction * Math.pow(1 + annualGrowthRate, years);
    const difference = predictedProduction - baseProduction;
    const unitAddition = difference / icons.length;

    const addedTotal = Object.values(added).reduce((sum, v) => sum + v, 0);
    const newTotalTWh = baseProduction + addedTotal;

    const displayTechs = allTechnologies
        .map(base => {
            const tech = country.technologies.find(t => t.id === base.id);
            const originalShare = tech ? tech.share : 0;
            const originalGenerationTWh = originalShare * baseProduction;
            const addedThis = added[base.id] || 0;
            const newGenerationTWh = originalGenerationTWh + addedThis;
            const newShare = newTotalTWh > 0 ? newGenerationTWh / newTotalTWh : 0;
            const generationGWh = Math.round(newGenerationTWh * 1000);
            let displayGeneration: string;
            let unit: string;
            if (generationGWh > 999) {
                displayGeneration = String(Math.round(generationGWh / 1000));
                unit = 'TWh';
            } else {
                displayGeneration = String(generationGWh);
                unit = 'GWh';
            }
            return {
                ...base,
                share: newShare,
                displayGeneration,
                unit,
            };
        })
        .sort((a, b) => b.share - a.share);

    const leftColumn = displayTechs.filter((_, index) => index % 2 === 0);
    const rightColumn = displayTechs.filter((_, index) => index % 2 !== 0);

    const formatTotal = (value: number) => {
        const valueGWh = Math.round(value * 1000);
        if (valueGWh > 999) {
            return `${Math.round(valueGWh / 1000)} TWh`;
        } else {
            return `${valueGWh} GWh`;
        }
    }

    const currentDisplay = formatTotal(newTotalTWh);
    const predictedDisplay = formatTotal(predictedProduction);

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, delay: 0.5 + i * 0.1 },
        }),
    };

    const iconVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, delay: 0.9 + i * 0.05 },
        }),
    };

    return (
        <div className="border border-emerald-200 p-6 rounded-xl bg-white shadow-lg max-w-3xl mx-auto">
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-2xl font-bold mb-6 text-center text-emerald-800"
            >
                Current Energy Mix
            </motion.h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex flex-col gap-4">
                    {leftColumn.map((t, index) => (
                        <motion.div 
                            key={`${t.id}-${country.id}`} 
                            custom={index}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            ref={(el) => techRefs.current[t.id] = el}
                            className="grid grid-cols-2 gap-2 border rounded-lg p-2 bg-gray-50 hover:shadow-md transition-shadow duration-200 min-h-[60px]"
                        >
                            <div className="flex flex-col items-center justify-center">
                                <img 
                                    src={`/icons/${t.id}.png`} 
                                    alt={`${t.name} icon`} 
                                    className="w-8 h-8 mb-2" 
                                />
                                <span className="text-sm font-medium text-center text-gray-800">{t.name}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center border-l border-emerald-100 pl-2">
                                <span className="font-semibold text-emerald-700 text-lg text-center">{(t.share * 100).toFixed(0)}%</span>
                                <span className="text-sm text-gray-600 text-center">{t.displayGeneration} {t.unit}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
                <div className="flex flex-col gap-4">
                    {rightColumn.map((t, index) => (
                        <motion.div 
                            key={`${t.id}-${country.id}`} 
                            custom={index}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            ref={(el) => techRefs.current[t.id] = el}
                            className="grid grid-cols-2 gap-2 border rounded-lg p-2 bg-gray-50 hover:shadow-md transition-shadow duration-200 min-h-[60px]"
                        >
                            <div className="flex flex-col items-center justify-center">
                                <img 
                                    src={`/icons/${t.id}.png`} 
                                    alt={`${t.name} icon`} 
                                    className="w-8 h-8 mb-2" 
                                />
                                <span className="text-sm font-medium text-center text-gray-800">{t.name}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center border-l border-emerald-100 pl-2">
                                <span className="font-semibold text-emerald-700 text-lg text-center">{(t.share * 100).toFixed(0)}%</span>
                                <span className="text-sm text-gray-600 text-center">{t.displayGeneration} {t.unit}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Power icons */}
            <div className="flex justify-center gap-2 mb-8">
                {icons.map((icon, index) =>
                    !icon.used ? (
                        <motion.img
                            key={icon.id}
                            src="/icons/power.png"
                            alt="power icon"
                            className="w-8 h-8 cursor-grab"
                            ref={(el) => { iconRefs.current[index] = el; }}
                            drag
                            dragConstraints={false}
                            dragElastic={0.1}
                            variants={iconVariants}
                            initial="hidden"
                            animate="visible"
                            custom={index}
                            onDragStart={() => setCurrentDragIndex(icon.id)}
                            onDragEnd={(e, info) => {
                                const point = info.point;
                                let droppedOn: string | null = null;
                                for (const [id, ref] of Object.entries(techRefs.current)) {
                                    if (ref) {
                                        const rect = ref.getBoundingClientRect();
                                        if (
                                            point.x > rect.left &&
                                            point.x < rect.right &&
                                            point.y > rect.top &&
                                            point.y < rect.bottom
                                        ) {
                                            droppedOn = id;
                                            break;
                                        }
                                    }
                                }

                                if (droppedOn) {
                                    setAdded(prev => ({
                                        ...prev,
                                        [droppedOn]: (prev[droppedOn] || 0) + unitAddition
                                    }));
                                    setIcons(prev =>
                                        prev.map(ic => ic.id === icon.id ? { ...ic, used: true } : ic)
                                    );
                                } else {
                                    // Smooth return
                                    e.target.animate(
                                        [
                                            { transform: e.target.style.transform },
                                            { transform: "translate(0px,0px)" }
                                        ],
                                        { duration: 300, easing: "ease-out", fill: "forwards" }
                                    );
                                }

                                setCurrentDragIndex(-1);
                            }}
                        />
                    ) : null
                )}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="bg-emerald-50 p-4 rounded-lg shadow-md text-center"
            >
                <h3 className="text-xl font-semibold text-emerald-800 mb-2">Current Production</h3>
                <p className="text-3xl font-bold text-emerald-600">{currentDisplay}</p>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="bg-emerald-100 p-4 rounded-lg shadow-md text-center mt-4"
            >
                <h3 className="text-xl font-semibold text-emerald-800 mb-2">Required Production in 2050</h3>
                <p className="text-3xl font-bold text-emerald-700">{predictedDisplay}</p>
                <p className="text-sm text-gray-600 mt-1">Based on 2% annual growth rate</p>
            </motion.div>
        </div>
    )
}
