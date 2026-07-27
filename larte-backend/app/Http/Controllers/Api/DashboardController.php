<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;


class DashboardController extends Controller
{

    public function stats(Request $request)
    {
        return response()->json([
            'kpi'=>[
                'orders'=>[
                    'value'=>0,
                    'growth'=>'0%',
                    'isPositive'=>true,
                    'trend'=>[]
                ],
                'production'=>[
                    'value'=>0,
                    'growth'=>'0%',
                    'isPositive'=>true,
                    'trend'=>[]
                ]
            ],

            'distribution'=>[
                'total'=>0,
                'enAttente'=>0,
                'enProduction'=>0,
                'pretes'=>0,
                'livrees'=>0
            ]
        ]);
    }


    public function analytics()
    {
        return response()->json([
            'chartData'=>[
                'labels'=>[],
                'revenue'=>[],
                'orders'=>[],
                'production'=>[],
                'invoices'=>[]
            ]
        ]);
    }


    public function orders()
    {
        return response()->json([]);
    }


    public function notifications()
    {
        return response()->json([]);
    }


    public function production()
    {
        return response()->json([]);
    }


    public function topProducts()
    {
        return response()->json([]);
    }

}