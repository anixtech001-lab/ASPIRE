"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    CommunityProblem,
    CommunitySolution,
    subscribeToProblem,
    subscribeToSolutions,
    addSolution,
    toggleUpvote,
    markSolved,
    ensureAnonymousUser,
    relativeTime,
} from "@/lib/community";
import { ArrowLeft, ThumbsUp, CheckCircle2, Loader2, Send } from "lucide-react";

export default function ProblemDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const [problem, setProblem] = useState<CommunityProblem | null | undefined>(undefined);
    const [solutions, setSolutions] = useState<CommunitySolution[]>([]);
    const [myUid, setMyUid] = useState<string | null>(null);
    const [reply, setReply] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        ensureAnonymousUser()
            .then((user) => setMyUid(user.uid))
            .catch(() => {
                /* identity isn't required just to read the thread */
            });
        const unsubProblem = subscribeToProblem(id, setProblem);
        const unsubSolutions = subscribeToSolutions(id, setSolutions);
        return () => {
            unsubProblem();
            unsubSolutions();
        };
    }, [id]);

    const handleReply = async () => {
        if (!reply.trim()) return;
        setSubmitting(true);
        setError(null);
        try {
            await addSolution(id, reply);
            setReply("");
        } catch {
            setError("Couldn't post your reply right now. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (problem === undefined) {
        return (
            <div className="flex items-center justify-center py-24 text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" />
            </div>
        );
    }

    if (problem === null) {
        return (
            <div className="p-8 max-w-2xl mx-auto text-center">
                <p className="text-slate-500 mb-4">This problem doesn&apos;t exist or was removed.</p>
                <Link href="/community" className="text-emerald-600 font-medium text-sm hover:underline">
                    Back to Community
                </Link>
            </div>
        );
    }

    const isMyProblem = myUid && problem.authorUid === myUid;

    return (
        <div className="p-6 md:p-8 max-w-3xl mx-auto">
            <Link href="/community" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-4">
                <ArrowLeft className="h-4 w-4" /> Back to Community
            </Link>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-[11px] font-medium bg-slate-100 text-slate-600 rounded-full px-2.5 py-1">
                        {problem.category}
                    </span>
                    {problem.status === "solved" && (
                        <span className="flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-1">
                            <CheckCircle2 className="h-3 w-3" /> Solved
                        </span>
                    )}
                    {problem.location && <span className="text-[11px] text-slate-400">{problem.location}</span>}
                </div>
                <h1 className="text-xl font-semibold mb-2">{problem.title}</h1>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap mb-4">{problem.description}</p>
                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                        {problem.authorName} · {relativeTime(problem.createdAt)}
                    </span>
                    {isMyProblem && problem.status !== "solved" && (
                        <button
                            onClick={() => markSolved(id)}
                            className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:underline"
                        >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Mark as Solved
                        </button>
                    )}
                </div>
            </div>

            <h2 className="text-sm font-semibold text-slate-700 mb-3">
                {solutions.length} {solutions.length === 1 ? "Solution" : "Solutions"}
            </h2>

            <div className="space-y-3 mb-6">
                {solutions.length === 0 && (
                    <p className="text-sm text-slate-400 bg-white rounded-2xl border border-slate-200 p-5 text-center">
                        No replies yet — share what&apos;s worked for you.
                    </p>
                )}
                {solutions.map((s) => (
                    <SolutionCard key={s.id} problemId={id} solution={s} myUid={myUid} />
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="text-sm font-semibold mb-3">Share how you&apos;d solve this</h3>
                <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    placeholder="Write your suggestion or what worked for you..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-500 resize-none mb-3"
                />
                {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
                <button
                    onClick={handleReply}
                    disabled={submitting || !reply.trim()}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
                >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Post Reply
                </button>
            </div>
        </div>
    );
}

function SolutionCard({
    problemId,
    solution,
    myUid,
}: {
    problemId: string;
    solution: CommunitySolution;
    myUid: string | null;
}) {
    const upvoted = !!myUid && solution.upvotedBy.includes(myUid);
    const [busy, setBusy] = useState(false);

    const handleUpvote = async () => {
        setBusy(true);
        try {
            await toggleUpvote(problemId, solution.id, upvoted);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-3">{solution.text}</p>
            <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                    {solution.authorName} · {relativeTime(solution.createdAt)}
                </span>
                <button
                    onClick={handleUpvote}
                    disabled={busy}
                    className={`flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 border transition-colors ${upvoted
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                        }`}
                >
                    <ThumbsUp className="h-3 w-3" /> {solution.upvotedBy.length}
                </button>
            </div>
        </div>
    );
}
