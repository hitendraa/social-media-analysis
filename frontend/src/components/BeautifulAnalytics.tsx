import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import UniversalRenderer from './UniversalRenderer';

interface AnalyticsData {
    [key: string]: any;
}

const BeautifulAnalytics: React.FC<{ data: AnalyticsData }> = ({ data }) => {
    return (
        <div className="space-y-6 p-4 max-w-6xl mx-auto">
            {/* Header Card */}
            <Card className="bg-gradient-to-r from-blue-500 to-purple-500">
                <CardContent className="p-6">
                    <h1 className="text-3xl font-bold text-white mb-2">Social Media Analytics</h1>
                    {data.total_reels && <p className="text-white/90">Total Reels: {data.total_reels}</p>}
                    {data.analysis_of_static_image_posts?.data_overview?.total_static_image_posts && (
                        <p className="text-white/90">
                            Total Static Posts: {data.analysis_of_static_image_posts.data_overview.total_static_image_posts}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Render the rest of the data dynamically */}
            <UniversalRenderer data={data} />
        </div>
    );
};

export default BeautifulAnalytics;