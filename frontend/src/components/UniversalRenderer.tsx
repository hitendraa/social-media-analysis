import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, BarChart2, Zap } from 'lucide-react';

interface UniversalRendererProps {
    data: any;
    depth?: number;
}

const UniversalRenderer: React.FC<UniversalRendererProps> = ({ data, depth = 0 }) => {
    // Fallback for empty or invalid data
    if (!data || Object.keys(data).length === 0) {
        return null; // Don't render anything if data is empty
    }

    // Base case: if data is a primitive value, render it
    if (typeof data !== 'object' || data === null) {
        return <p className="text-gray-700">{data?.toString()}</p>;
    }

    // If data is an array, render each item
    if (Array.isArray(data)) {
        if (data.length === 0) return null; // Don't render empty arrays

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.map((item, index) => {
                    // Skip rendering if the item is empty or invalid
                    if (!item || (typeof item === 'object' && Object.keys(item).length === 0)) {
                        return null;
                    }

                    return (
                        <div key={index} className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                            <UniversalRenderer data={item} depth={depth + 1} />
                        </div>
                    );
                })}
            </div>
        );
    }

    // If data is an object, prioritize rendering insights first
    return (
        <div className="space-y-4">
            {/* Render insights first if they exist and are non-empty */}
            {data.insights && Array.isArray(data.insights) && data.insights.length > 0 && (
                <Card className="bg-white shadow-sm rounded-lg border border-gray-100">
                    <CardHeader>
                        <CardTitle className="capitalize flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-purple-500" />
                            Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UniversalRenderer data={data.insights} depth={depth + 1} />
                    </CardContent>
                </Card>
            )}

            {/* Render calculations if they exist and are non-empty */}
            {data.calculations && typeof data.calculations === 'object' && Object.keys(data.calculations).length > 0 && (
                <Card className="bg-white shadow-sm rounded-lg border border-gray-100">
                    <CardHeader>
                        <CardTitle className="capitalize flex items-center gap-2">
                            <BarChart2 className="h-5 w-5 text-blue-500" />
                            Calculations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UniversalRenderer data={data.calculations} depth={depth + 1} />
                    </CardContent>
                </Card>
            )}

            {/* Render data limitations if they exist and are non-empty */}
            {data.data_limitations && Array.isArray(data.data_limitations) && data.data_limitations.length > 0 && (
                <Card className="bg-white shadow-sm rounded-lg border border-gray-100">
                    <CardHeader>
                        <CardTitle className="capitalize flex items-center gap-2">
                            <Zap className="h-5 w-5 text-red-500" />
                            Data Limitations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UniversalRenderer data={data.data_limitations} depth={depth + 1} />
                    </CardContent>
                </Card>
            )}

            {/* Render other keys except insights, calculations, and data_limitations */}
            {Object.entries(data)
                .filter(
                    ([key]) =>
                        key !== 'insights' &&
                        key !== 'calculations' &&
                        key !== 'data_limitations'
                )
                .map(([key, value]) => {
                    // Skip rendering if the value is empty or invalid
                    if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) {
                        return null;
                    }

                    // Special handling for engagement metrics (render as a chart)
                    if (key === 'engagement_metrics' || key === 'performance_metrics_by_platform') {
                        const chartData = Object.entries(value).map(([platform, metrics]) => ({
                            platform,
                            ...(metrics as object),
                        }));

                        // Skip rendering if chartData is empty
                        if (chartData.length === 0) return null;

                        return (
                            <Card key={key} className="bg-white shadow-sm rounded-lg border border-gray-100">
                                <CardHeader>
                                    <CardTitle className="capitalize flex items-center gap-2">
                                        <BarChart2 className="h-5 w-5 text-blue-500" />
                                        {key.replace(/_/g, ' ')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData}>
                                                <XAxis dataKey="platform" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="average_likes" fill="#8884d8" name="Avg. Likes" />
                                                <Bar dataKey="average_comments" fill="#82ca9d" name="Avg. Comments" />
                                                <Bar dataKey="average_shares" fill="#ffc658" name="Avg. Shares" />
                                                <Bar dataKey="average_reach" fill="#0088FE" name="Avg. Reach" />
                                                <Bar dataKey="average_impressions" fill="#00C49F" name="Avg. Impressions" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    }

                    // Default rendering for other objects
                    return (
                        <Card key={key} className="bg-white shadow-sm rounded-lg border border-gray-100">
                            <CardHeader>
                                <CardTitle className="capitalize flex items-center gap-2">
                                    {key.replace(/_/g, ' ')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <UniversalRenderer data={value} depth={depth + 1} />
                            </CardContent>
                        </Card>
                    );
                })}
        </div>
    );
};

export default UniversalRenderer;