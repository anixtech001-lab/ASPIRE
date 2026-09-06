import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { BusinessDetails } from "@/lib/BusinessContext";
import { FeasibilityReport } from "@/lib/ai";
import { FullFinancialPlan, calculateQuarterlyAmortization, formatINR } from "@/lib/financialEngine";
import { matchScheme } from "@/lib/schemeMatching";
import { SCHEMES } from "@/lib/schemesData";

const GREEN = "#2C5F2D";
const MOSS = "#97BC62";
const AMBER = "#B45309";
const RED = "#B91C1C";
const SLATE = "#475569";

const styles = StyleSheet.create({
    page: { padding: 40, fontSize: 10, color: "#1e293b", fontFamily: "Helvetica" },
    watermark: {
        position: "absolute",
        top: "45%",
        left: "20%",
        fontSize: 60,
        color: GREEN,
        opacity: 0.06,
        fontFamily: "Helvetica-Bold",
    },
    coverContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    coverBrand: { fontSize: 28, fontFamily: "Helvetica-Bold", color: GREEN, marginBottom: 4 },
    coverTagline: { fontSize: 9, color: SLATE, marginBottom: 40 },
    coverTitle: { fontSize: 20, fontFamily: "Helvetica-Bold", marginBottom: 10, textAlign: "center" },
    coverSub: { fontSize: 12, color: SLATE, marginBottom: 30, textAlign: "center" },
    coverMeta: { fontSize: 9, color: "#94a3b8" },
    sectionTitle: { fontSize: 14, fontFamily: "Helvetica-Bold", color: GREEN, marginBottom: 8, marginTop: 16 },
    subTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 4, marginTop: 10 },
    paragraph: { fontSize: 9.5, lineHeight: 1.5, color: "#334155", marginBottom: 6 },
    highlightBox: {
        flexDirection: "row",
        backgroundColor: "#f0fdf4",
        borderRadius: 6,
        padding: 12,
        marginVertical: 10,
        justifyContent: "space-between",
    },
    highlightItem: { flexDirection: "column" },
    highlightLabel: { fontSize: 8, color: SLATE },
    highlightValue: { fontSize: 12, fontFamily: "Helvetica-Bold", color: GREEN, marginTop: 2 },
    table: { display: "flex", width: "100%", marginTop: 6, marginBottom: 6 },
    tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" },
    tableHeaderRow: { flexDirection: "row", backgroundColor: "#f1f5f9", paddingVertical: 4 },
    th: { fontSize: 8, fontFamily: "Helvetica-Bold", color: SLATE, paddingHorizontal: 4, paddingVertical: 3 },
    td: { fontSize: 8.5, paddingHorizontal: 4, paddingVertical: 3 },
    swotGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 6, marginBottom: 6, borderWidth: 0.5, borderColor: "#e2e8f0" },
    swotCell: { width: "50%", padding: 8, borderWidth: 0.5, borderColor: "#e2e8f0" },
    swotTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 4 },
    swotItem: { fontSize: 8, marginBottom: 2 },
    footer: {
        position: "absolute",
        bottom: 20,
        left: 40,
        right: 40,
        fontSize: 7,
        color: "#94a3b8",
        borderTopWidth: 0.5,
        borderTopColor: "#e2e8f0",
        paddingTop: 6,
        textAlign: "center",
    },
    pageNumber: { position: "absolute", bottom: 20, right: 40, fontSize: 7, color: "#94a3b8" },
});

function Watermark() {
    return <Text style={styles.watermark}>ASPIRE</Text>;
}

function Footer({ pageNum }: { pageNum: number }) {
    return (
        <>
            <Text style={styles.footer} fixed>
                This report is AI-generated guidance based on user-provided inputs and is not a
                substitute for formal financial or legal advice. Verify all scheme details with the
                official Channel Partner before applying. — ASPIRE
            </Text>
            <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
        </>
    );
}

function severityColor(sev: string) {
    return sev === "Low" ? GREEN : sev === "High" ? RED : AMBER;
}

interface ReportPDFProps {
    businessDetails: BusinessDetails;
    feasibilityReport: FeasibilityReport;
    financialPlan: FullFinancialPlan;
}

export default function ReportPDFDocument({ businessDetails, feasibilityReport, financialPlan }: ReportPDFProps) {
    const matchedSchemes = SCHEMES.map((scheme) => ({
        scheme,
        match: matchScheme(businessDetails, financialPlan.details.projectCost, scheme.criteria),
    }))
        .filter((r) => r.match.matchLabel !== "Likely Not Applicable")
        .sort((a, b) => b.match.score - a.match.score);

    const amortization =
        !financialPlan.details.exceedsLimits && financialPlan.details.scheme
            ? calculateQuarterlyAmortization(
                financialPlan.details.loanAmount,
                financialPlan.details.scheme.interestRate,
                financialPlan.details.scheme.tenureYears,
                financialPlan.details.scheme.moratoriumMonths
            )
            : [];

    const dateStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

    return (
        <Document title={`ASPIRE Report - ${businessDetails.businessCategory}`}>
            {/* Cover Page */}
            <Page size="A4" style={styles.page}>
                <Watermark />
                <View style={styles.coverContainer}>
                    <Text style={styles.coverBrand}>ASPIRE</Text>
                    <Text style={styles.coverTagline}>AI-driven Support for Project Investment and Rural Entrepreneurship</Text>
                    <Text style={styles.coverTitle}>Business Feasibility &amp; Financial Report</Text>
                    <Text style={styles.coverSub}>
                        {businessDetails.businessCategory} · {businessDetails.location}, {businessDetails.state}
                    </Text>
                    <Text style={styles.coverMeta}>Generated on {dateStr}</Text>
                </View>
            </Page>

            {/* Executive Summary + Feasibility Analysis */}
            <Page size="A4" style={styles.page}>
                <Watermark />
                <Text style={styles.sectionTitle}>Executive Summary</Text>
                <Text style={styles.paragraph}>{feasibilityReport.executiveSummary}</Text>

                <View style={styles.highlightBox}>
                    <View style={styles.highlightItem}>
                        <Text style={styles.highlightLabel}>PROJECT COST</Text>
                        <Text style={styles.highlightValue}>{formatINR(financialPlan.details.projectCost)}</Text>
                    </View>
                    <View style={styles.highlightItem}>
                        <Text style={styles.highlightLabel}>LOAN AMOUNT</Text>
                        <Text style={styles.highlightValue}>{formatINR(financialPlan.details.loanAmount)}</Text>
                    </View>
                    <View style={styles.highlightItem}>
                        <Text style={styles.highlightLabel}>RECOMMENDED SCHEME</Text>
                        <Text style={styles.highlightValue}>{financialPlan.details.scheme?.name ?? "Manual Review"}</Text>
                    </View>
                    <View style={styles.highlightItem}>
                        <Text style={styles.highlightLabel}>FEASIBILITY SCORE</Text>
                        <Text style={styles.highlightValue}>{feasibilityReport.feasibilityScore}/100</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Hyper-Local Feasibility Analysis</Text>

                <Text style={styles.subTitle}>Market Reach</Text>
                <Text style={styles.paragraph}>{feasibilityReport.marketReach.summary}</Text>
                <Text style={styles.paragraph}>
                    Estimated population — within 5km: ~{feasibilityReport.marketReach.population5km.toLocaleString("en-IN")} ·
                    within 10km: ~{feasibilityReport.marketReach.population10km.toLocaleString("en-IN")}
                </Text>
                <Text style={styles.paragraph}>Distribution channels: {feasibilityReport.marketReach.channels.join(", ")}</Text>

                <Text style={styles.subTitle}>Opportunity Analysis</Text>
                {feasibilityReport.opportunityAnalysis.map((o, i) => (
                    <Text key={i} style={styles.paragraph}>
                        • {o.title}: {o.description}
                    </Text>
                ))}

                <Text style={styles.subTitle}>SWOT Analysis</Text>
                <View style={styles.swotGrid}>
                    <View style={styles.swotCell}>
                        <Text style={[styles.swotTitle, { color: GREEN }]}>Strengths</Text>
                        {feasibilityReport.swot.strengths.map((s, i) => (
                            <Text key={i} style={styles.swotItem}>• {s}</Text>
                        ))}
                    </View>
                    <View style={styles.swotCell}>
                        <Text style={[styles.swotTitle, { color: AMBER }]}>Weaknesses</Text>
                        {feasibilityReport.swot.weaknesses.map((s, i) => (
                            <Text key={i} style={styles.swotItem}>• {s}</Text>
                        ))}
                    </View>
                    <View style={styles.swotCell}>
                        <Text style={[styles.swotTitle, { color: "#1d4ed8" }]}>Opportunities</Text>
                        {feasibilityReport.swot.opportunities.map((s, i) => (
                            <Text key={i} style={styles.swotItem}>• {s}</Text>
                        ))}
                    </View>
                    <View style={styles.swotCell}>
                        <Text style={[styles.swotTitle, { color: RED }]}>Threats</Text>
                        {feasibilityReport.swot.threats.map((s, i) => (
                            <Text key={i} style={styles.swotItem}>• {s}</Text>
                        ))}
                    </View>
                </View>

                <Text style={styles.subTitle}>Threats Identification</Text>
                <Text style={styles.paragraph}>{feasibilityReport.threatsIdentification.summary}</Text>
                <View style={styles.table}>
                    <View style={styles.tableHeaderRow}>
                        <Text style={[styles.th, { width: "70%" }]}>Risk</Text>
                        <Text style={[styles.th, { width: "30%" }]}>Severity</Text>
                    </View>
                    {feasibilityReport.threatsIdentification.risks.map((r, i) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={[styles.td, { width: "70%" }]}>{r.name}</Text>
                            <Text style={[styles.td, { width: "30%", color: severityColor(r.severity), fontFamily: "Helvetica-Bold" }]}>
                                {r.severity}
                            </Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.subTitle}>Competitor Mapping</Text>
                <Text style={styles.paragraph}>{feasibilityReport.competitorMapping.summary}</Text>
                <Text style={styles.paragraph}>
                    Market Saturation Level:{" "}
                    <Text style={{ color: severityColor(feasibilityReport.competitorMapping.saturationLevel), fontFamily: "Helvetica-Bold" }}>
                        {feasibilityReport.competitorMapping.saturationLevel}
                    </Text>
                </Text>

                <Text style={styles.subTitle}>Product Market Value &amp; Pricing</Text>
                <Text style={styles.paragraph}>{feasibilityReport.productMarketValue.summary}</Text>
                {feasibilityReport.productMarketValue.suggestedPrice > 0 && (
                    <Text style={styles.paragraph}>
                        Suggested Price: ₹{feasibilityReport.productMarketValue.suggestedPrice} {feasibilityReport.productMarketValue.unit}{" "}
                        (Regional Average: ₹{feasibilityReport.productMarketValue.regionalAveragePrice})
                    </Text>
                )}

                <Footer pageNum={2} />
            </Page>

            {/* Financial Structuring */}
            <Page size="A4" style={styles.page}>
                <Watermark />
                <Text style={styles.sectionTitle}>Financial Structuring</Text>

                {financialPlan.details.exceedsLimits ? (
                    <Text style={styles.paragraph}>
                        Project cost of {formatINR(financialPlan.details.projectCost)} exceeds standard scheme limits — this
                        application needs manual review by a Channel Partner.
                    </Text>
                ) : (
                    <>
                        <View style={styles.highlightBox}>
                            <View style={styles.highlightItem}>
                                <Text style={styles.highlightLabel}>SCHEME</Text>
                                <Text style={styles.highlightValue}>{financialPlan.details.scheme!.name}</Text>
                            </View>
                            <View style={styles.highlightItem}>
                                <Text style={styles.highlightLabel}>INTEREST RATE</Text>
                                <Text style={styles.highlightValue}>{financialPlan.details.scheme!.interestRate}% p.a.</Text>
                            </View>
                            <View style={styles.highlightItem}>
                                <Text style={styles.highlightLabel}>TENURE</Text>
                                <Text style={styles.highlightValue}>{financialPlan.details.scheme!.tenureYears} yrs</Text>
                            </View>
                            <View style={styles.highlightItem}>
                                <Text style={styles.highlightLabel}>MORATORIUM</Text>
                                <Text style={styles.highlightValue}>{financialPlan.details.scheme!.moratoriumMonths} mo</Text>
                            </View>
                        </View>

                        <Text style={styles.subTitle}>Repayment Schedule (Quarterly)</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeaderRow}>
                                <Text style={[styles.th, { width: "12%" }]}>Qtr</Text>
                                <Text style={[styles.th, { width: "22%" }]}>Opening Bal.</Text>
                                <Text style={[styles.th, { width: "17%" }]}>EMI</Text>
                                <Text style={[styles.th, { width: "17%" }]}>Principal</Text>
                                <Text style={[styles.th, { width: "16%" }]}>Interest</Text>
                                <Text style={[styles.th, { width: "16%" }]}>Closing Bal.</Text>
                            </View>
                            {amortization.map((row) => (
                                <View key={row.quarter} style={styles.tableRow}>
                                    <Text style={[styles.td, { width: "12%" }]}>
                                        Q{row.quarter}
                                        {row.isMoratorium ? "*" : ""}
                                    </Text>
                                    <Text style={[styles.td, { width: "22%" }]}>{formatINR(row.openingBalance)}</Text>
                                    <Text style={[styles.td, { width: "17%" }]}>{formatINR(row.emi)}</Text>
                                    <Text style={[styles.td, { width: "17%" }]}>{formatINR(row.principalPaid)}</Text>
                                    <Text style={[styles.td, { width: "16%" }]}>{formatINR(row.interestPaid)}</Text>
                                    <Text style={[styles.td, { width: "16%" }]}>{formatINR(row.closingBalance)}</Text>
                                </View>
                            ))}
                        </View>
                        <Text style={{ fontSize: 7, color: "#94a3b8", marginTop: 4 }}>* Moratorium quarter — interest-only payment</Text>
                    </>
                )}

                <Footer pageNum={3} />
            </Page>

            {/* Matched Government Schemes */}
            <Page size="A4" style={styles.page}>
                <Watermark />
                <Text style={styles.sectionTitle}>Matched Government Schemes</Text>
                <Text style={styles.paragraph}>
                    Based on your business category and project cost, ranked by eligibility match.
                </Text>

                <View style={styles.table}>
                    <View style={styles.tableHeaderRow}>
                        <Text style={[styles.th, { width: "8%" }]}>Rank</Text>
                        <Text style={[styles.th, { width: "30%" }]}>Scheme</Text>
                        <Text style={[styles.th, { width: "20%" }]}>Match</Text>
                        <Text style={[styles.th, { width: "42%" }]}>Reasoning</Text>
                    </View>
                    {matchedSchemes.map(({ scheme, match }, i) => (
                        <View key={scheme.name} style={styles.tableRow}>
                            <Text style={[styles.td, { width: "8%" }]}>#{i + 1}</Text>
                            <Text style={[styles.td, { width: "30%", fontFamily: "Helvetica-Bold" }]}>{scheme.name}</Text>
                            <Text
                                style={[
                                    styles.td,
                                    { width: "20%", fontFamily: "Helvetica-Bold" },
                                    match.matchLabel === "Strong Match" ? { color: GREEN } : { color: AMBER },
                                ]}
                            >
                                {match.matchLabel}
                            </Text>
                            <Text style={[styles.td, { width: "42%" }]}>{[...match.reasons, ...match.caveats].join(" · ")}</Text>
                        </View>
                    ))}
                </View>

                <Footer pageNum={4} />
            </Page>
        </Document>
    );
}
