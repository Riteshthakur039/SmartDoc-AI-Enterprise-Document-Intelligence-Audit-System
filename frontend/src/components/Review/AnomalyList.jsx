import React from 'react';
import { AlertCircle, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

export default function AnomalyList({ anomalies }) {
    if (!anomalies) return null;

    // Handle both array of objects or object with rule_violations
    const anomalyArray = Array.isArray(anomalies.anomalies) ? anomalies.anomalies : [];
    const ruleViolations = anomalies.rule_violations ? Object.entries(anomalies.rule_violations) : [];

    if (anomalyArray.length === 0 && ruleViolations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-green-50/50 rounded-xl border border-green-100">
                <ShieldAlert className="w-12 h-12 text-green-500 mb-3" />
                <h4 className="text-lg font-semibold text-green-800">No Anomalies Detected</h4>
                <p className="text-sm text-green-600 mt-1">This document passes all safety and rule checks.</p>
            </div>
        );
    }

    const getSeverityStyles = (severity) => {
        const styles = {
            high: 'bg-red-50 text-red-700 border-red-100',
            medium: 'bg-orange-50 text-orange-700 border-orange-100',
            low: 'bg-blue-50 text-blue-700 border-blue-100'
        };
        return styles[severity?.toLowerCase()] || styles.low;
    };

    const getIcon = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'high': return <ShieldAlert className="w-5 h-5 text-red-500 mr-3 shrink-0" />;
            case 'medium': return <AlertTriangle className="w-5 h-5 text-orange-500 mr-3 shrink-0" />;
            default: return <Info className="w-5 h-5 text-blue-500 mr-3 shrink-0" />;
        }
    };

    return (
        <div className="space-y-4">
            {/* LLM Detected Anomalies */}
            {anomalyArray.map((anomaly, idx) => (
                <div key={`anom-${idx}`} className={`p-4 rounded-xl border flex items-start ${getSeverityStyles(anomaly.severity)}`}>
                    {getIcon(anomaly.severity)}
                    <div>
                        <p className="text-sm font-bold uppercase tracking-wider mb-1 opacity-70">{anomaly.category || 'Anomaly'}</p>
                        <p className="text-sm leading-relaxed">{anomaly.description}</p>
                        {anomaly.field && (
                            <code className="text-xs mt-2 block font-mono opacity-60">Field: {anomaly.field}</code>
                        )}
                    </div>
                </div>
            ))}

            {/* Rule Violations from Backend */}
            {ruleViolations.map(([key, value], idx) => (
                <div key={`rule-${idx}`} className="p-4 rounded-xl border border-red-100 bg-red-50 text-red-700 flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3 shrink-0" />
                    <div>
                        <p className="text-sm font-bold uppercase tracking-wider mb-1 opacity-70">Rule Violation</p>
                        <p className="text-sm leading-relaxed">{value}</p>
                        <code className="text-xs mt-2 block font-mono opacity-60">Key: {key}</code>
                    </div>
                </div>
            ))}
        </div>
    );
}
