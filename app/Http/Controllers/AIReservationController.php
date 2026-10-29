<?php

namespace App\Http\Controllers;

use App\Services\AIReservationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AIReservationController extends Controller
{
    public function __construct(
        protected AIReservationService $aiService
    ) {}

    /**
     * Display the AI Reservation Assistant chat interface.
     */
    public function index(Request $request): Response
    {
        $student = $request->user();

        // Sample starter prompts
        $sampleQuestions = [
            'What is my reservation status?',
            'What is my queue position?',
            'How do I reserve a uniform?',
            'Can I cancel my reservation?',
            'How do I claim my uniform?',
            'Is uniform size available?',
        ];

        return Inertia::render('ai-assistant/index', [
            'student_name'     => $student->name,
            'sample_questions' => $sampleQuestions,
        ]);
    }

    /**
     * Process student message and return AI response.
     */
    public function chat(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'history' => 'nullable|array|max:20',
            'history.*.sender' => 'required_with:history|string|in:student,ai',
            'history.*.text'   => 'required_with:history|string|max:2000',
        ]);

        $student = $request->user();
        $message = $request->input('message');
        $history = $request->input('history', []);

        $reply = $this->aiService->ask($student, $message, $history);

        return response()->json([
            'reply'     => $reply,
            'timestamp' => now()->toISOString(),
        ]);
    }
}
